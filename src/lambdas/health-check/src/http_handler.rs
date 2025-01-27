use lambda_http::{Body, Error, Request, RequestExt, Response};

pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let message = "OK";

    // Get event
    let event = event
        .query_string_parameters_ref()
        .and_then(|params| params.first("name"))
        .unwrap_or("world");

    println!("Event: {}", event);

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(message.into())
        .map_err(Box::new)?;

    Ok(resp)
}