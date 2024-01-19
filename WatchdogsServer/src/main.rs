

use actix_web::{web, App, HttpServer,HttpResponse, Result};
use actix_files::NamedFile;
use std::fs::File;
use std::io;
use std::io::prelude::*;
use serde::Deserialize;
use serde::Serialize;
use std::env;
use std::error::Error;
use std::io::{prelude::*, Error as IOError};

// static filepath: &str ="src/events.csv";

#[derive(Debug, Deserialize, Serialize)]
struct Event {
        id: String,
        date: String,
        eventtype: String,
        veranstaltung: String,
        from: String,
        till: String,
        waspause: String,
        pausetime:String,
        
}
#[derive(Debug, Deserialize, Serialize)]
struct  Veranstaltung{
    veranstaltung: String,
    timeSpent: u32 ,
    maxTime: u32,
    semester: u32,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    

    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").to(index))
            .service(web::resource("api/events/post").route(web::post().to(update_events)))
            .service(web::resource("api/events/json").route(web::get().to(get_events_json)))
            .service(web::resource("api/veranstaltungen/post").route(web::post().to(update_veranstaltungen)))
            .service(web::resource("api/veranstaltungen/json").route(web::get().to(get_veranstaltungen_json)))
            .service(web::resource("/{filename:.*}").to(static_files))
            // .service(web::resource("api/events/csv").to(get_events_csv))
            
        
            
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open("static/index.html")?)
}

async fn static_files(info: web::Path<String>) -> Result<NamedFile> {
    Ok(NamedFile::open(format!("static/{}", info))?)
}

async fn update_events(events: web::Json<Vec<Event>>) -> HttpResponse {
    println!("Received Events: {:?}", events);
    save_events(&events);
    

    HttpResponse::Ok().json("Events updated successfully")
    // Save the events to a file or database
   
}

async fn update_veranstaltungen(veranstaltungen: web::Json<Vec<Veranstaltung>>) -> HttpResponse {
    println!("Received Veranstaltungen: {:?}", veranstaltungen);
    save_veranstaltungen(&veranstaltungen);

    HttpResponse::Ok().json("Veranstaltungen updated successfully")
    // Save the veranstaltungen to a file or database
}



fn save_veranstaltungen(veranstaltungen: &Vec<Veranstaltung>) {
    // Open the CSV file in append mode
    let mut file = File::create("src/veranstaltungen.csv").unwrap();
    writeln!(file, "veranstaltung,timeSpent,maxTime,semester").unwrap();

    for veranstaltung in veranstaltungen {
        writeln!(
            file,
            "{},{},{},{}",
            veranstaltung.veranstaltung,
            veranstaltung.timeSpent,
            veranstaltung.maxTime,
            veranstaltung.semester
        )
        .unwrap();
    }

    println!("Veranstaltungen saved to veranstaltungen.csv");
}


fn save_events(events: &Vec<Event>) {
    // Open the CSV file in append mode
    let mut file = File::create("src/events.csv").unwrap();
    writeln!(file, "id,date,typeevent,veranstaltung,from,till,waspause,pausetime").unwrap();

    for event in events {
        writeln!(
            file,
            "{},{},{},{},{},{},{},{}",
            event.id,
            event.date,
            event.eventtype,
            event.veranstaltung,
            event.from,
            event.till,
            event.waspause,
            event.pausetime
        )
        .unwrap();
    }

    println!("Events saved to events.csv");
}



//  async fn get_events_csv() -> Result<NamedFile> {
//     Ok(NamedFile::open("events.csv").unwrap())
// }

async fn get_events_json() -> HttpResponse {
    // Read events from the CSV file
    match read_events() {
        Ok(events) => HttpResponse::Ok().json(events),
        Err(err) => HttpResponse::InternalServerError().body(format!("Error reading events: {}", err)),
    }
}

async fn get_veranstaltungen_json() -> HttpResponse {
    // Read veranstaltungen from the CSV file
    match read_veranstaltungen() {
        Ok(veranstaltungen) => HttpResponse::Ok().json(veranstaltungen),
        Err(err) => HttpResponse::InternalServerError()
            .body(format!("Error reading veranstaltungen: {}", err)),
    }
}

fn read_events() -> Result<Vec<Event>, Box<dyn Error>> {
    // Get the current directory
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Construct the file path
    let file_path = current_dir.join("src").join("events.csv");
    // println!("Full path to events.csv: {}", file_path.display());

    // Open the CSV file with options in read mode
    let file = File::open(&file_path)?;

    // Read the file line by line and parse each line into an Event
    let events: Result<Vec<Event>, Box<dyn Error>> = io::BufReader::new(file)
        .lines()
        .skip(1) // Skip the header line
        .map(|line| {
            let line = line?;
            let fields: Vec<&str> = line.split(',').collect();

            Ok(Event {
        id: fields[0].to_string(),
        date: fields[1].to_string(),
        eventtype: fields[2].to_string(),
        veranstaltung: fields[3].to_string(),
        from: fields[4].to_string(),
        till: fields[5].to_string(),
        waspause: fields[6].to_string(),
        pausetime: fields[7].to_string(),
            })
        })
        .collect();

    events
}



fn read_veranstaltungen() -> Result<Vec<Veranstaltung>, Box<dyn Error>> {
    // Get the current directory
    let current_dir = env::current_dir().expect("Failed to get current directory");

    // Construct the file path
    let file_path = current_dir.join("src").join("veranstaltungen.csv");

    // Open the CSV file with options in read mode
    let file = File::open(&file_path)?;

    // Read the file line by line and parse each line into a Veranstaltung
    let veranstaltungen: Result<Vec<Veranstaltung>, Box<dyn Error>> = io::BufReader::new(file)
        .lines()
        .skip(1) // Skip the header line
        .map(|line| {
            let line = line?;
            let fields: Vec<&str> = line.split(',').collect();

            Ok(Veranstaltung {
                veranstaltung: fields[0].to_string(),
                timeSpent: fields[1].parse().unwrap(), // Assuming timeSpent is a u32
                maxTime: fields[2].parse().unwrap(),  // Assuming maxTime is a u32
                semester: fields[3].parse().unwrap(),   // Assuming semester is a u32
            })
        })
        .collect();

    veranstaltungen
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_events() {
        // Save the original directory
        let original_dir = std::env::current_dir().unwrap();

        // Change to the directory containing events.csv
        let events_dir = original_dir.join("events.csv");
        std::env::set_current_dir(&events_dir).expect("Failed to set current dir");

        // Call read_events to read from events.csv
        let events_result = read_events();

        // Change back to the original directory
        std::env::set_current_dir(original_dir).expect("Failed to set current dir");

        // Verify that the function returns the expected result
        assert!(events_result.is_ok());
        let events = events_result.unwrap();

       

        // Example: Verify the data of the first event
        assert_eq!(events[0].veranstaltung, "YourExpectedEventName");
        assert_eq!(events[0].date, "YourExpectedDate");
        // Add more assertions as needed
    }
}