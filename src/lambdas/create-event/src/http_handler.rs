use shared::response::{empty_response, json_response};
use lambda_http::{Body, Error, Request, RequestPayloadExt, Response, tracing};
use aws_sdk_dynamodb::{
    types::AttributeValue,
    Client
};
use serde::{Serialize, Deserialize};
use lambda_http::http::StatusCode;
use ulid::Ulid;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum EventStatus {
    Active,
    Inactive,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
enum EventType {
    Meetup,
    SpecialMeetup,
    CommunityDay,
    Workshop,
}

#[derive(Serialize, Deserialize)]
struct Event {
    name: String,
    description: String,
    event_date: String,
    event_time: String,
    event_type: EventType,
    location: String,
    status: EventStatus,
}

#[derive(Serialize, Deserialize)]
struct EventResponse {
    name: String,
    description: String,
    event_date: String,
    event_time: String,
    event_type: EventType,
    location: String,
    status: EventStatus,
}

impl ToString for EventType {
    fn to_string(&self) -> String {
        match self {
            EventType::Meetup => String::from("meetup"),
            EventType::SpecialMeetup => String::from("special_meetup"),
            EventType::CommunityDay => String::from("community_day"),
            EventType::Workshop => String::from("workshop"),
        }
    }
}

impl ToString for EventStatus {
    fn to_string(&self) -> String {
        match self {
            EventStatus::Active => String::from("active"),
            EventStatus::Inactive => String::from("inactive"),
        }
    }
}

pub(crate) async fn function_handler(
    event: Request,
    dynamodb_client: &Client,
    event_table: &String
) -> Result<Response<Body>, Error> {
    tracing::info!("Event: {:?}", event);

    let event_payload = event.payload::<Event>()?;
    let id = Ulid::new().to_string();

    match event_payload {
        None => empty_response(&StatusCode::BAD_REQUEST),
        Some(event) => {
            let result = dynamodb_client
                .put_item()
                .table_name(event_table)
                .item("id", AttributeValue::S(id.clone()))
                .item("name", AttributeValue::S(event.name.as_str().to_string()))
                .item("description", AttributeValue::S(event.description.as_str().to_string()))
                .item("event_date", AttributeValue::S(event.event_date.as_str().to_string()))
                .item("event_time", AttributeValue::S(event.event_time.as_str().to_string()))
                .item("event_type", AttributeValue::S(event.event_type.to_string()))
                .item("location", AttributeValue::S(event.location.as_str().to_string()))
                .item("status", AttributeValue::S(event.status.to_string()))
                .send()
                .await
                .map(|_| EventResponse {
                    name: event.name,
                    description: event.description,
                    event_date: event.event_date,
                    event_time: event.event_time,
                    event_type: event.event_type,
                    location: event.location,
                    status: event.status,
                })
                .map_err(|e| format!("Error adding item: {:?}", e));

            match result {
                Ok(response) => json_response(&StatusCode::OK, &response),
                Err(e) => {
                    tracing::error!("Failed to create event: {:?}", e);
                    empty_response(&StatusCode::INTERNAL_SERVER_ERROR)
                }
            }
        }
    }
}
