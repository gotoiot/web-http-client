/* MIT License

Copyright (c) 2021 Agustin Bassi (github.com/agustinBassi)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

//=======[ Settings & Data ]===================================================

const DEFAULT_REQUEST_URL    = "http://localhost:5000/status";
const DEFAULT_REQUEST_METHOD = "GET";
const DEFAULT_REQUEST_BODY   = "";
const DEFAULT_POLL_SECS      = 10;

var HttpHandler     = new XMLHttpRequest();
var PollReqInterval = null;

//=======[ App code ]==========================================================


function Http_ClearPollInterval(){
    if(PollReqInterval != null){
        clearInterval(PollReqInterval);
        PollReqInterval = null;
    }
}


function Http_IsIntervalSet(){
    return PollReqInterval != null;
}


function Http_GetRequestData(){
    // set default value at first
    let request_url = DEFAULT_REQUEST_URL;
    let request_body = DEFAULT_REQUEST_BODY;
    let request_method = DEFAULT_REQUEST_METHOD;
    let poll_checkbox = Utils_GetCheckboxValue("poll_checkbox");;
    let poll_secs = DEFAULT_POLL_SECS;
    // evaluate each value
    if(Utils_GetElementValue("request_url")){
        request_url = Utils_GetElementValue("request_url");
    }
    if(Utils_GetElementValue("request_body")){
        request_body = Utils_GetElementValue("request_body"); 
    }
    if(Utils_GetElementValue("request_method")){
        request_method = Utils_GetElementValue("request_method").toUpperCase(); 
    }
    if(Utils_GetElementValue("poll_secs")){
        poll_secs = parseInt(Utils_GetElementValue("poll_secs"));
    }
    return {
        "request_url": request_url,
        "request_body": request_body,
        "request_method": request_method,
        "poll_checkbox": poll_checkbox,
        "poll_secs": poll_secs,
    }
}


function App_ExcecuteHttpRequest(){
    var request_data = Http_GetRequestData();
    if(request_data["request_method"] != "GET" && request_data["request_method"] == "PUT" && request_data["request_method"] == "POST"){
        View_AppendLogData(LogLevel.ERROR, "Unsupported HTTP Method. Send GET, PUT or POST")
        return
    }
    Http_ClearPollInterval();
    View_AppendLogData(LogLevel.INFO, "HTTP request. Method: " + request_data["request_method"] + ". URL: " + request_data["request_url"]);
    // callback when HTTP request is done
    HttpHandler.onreadystatechange = function() {
        if (this.readyState == 4){
            response_code = HttpHandler.status;
            let response_body = HttpHandler.responseText;
            let response_body_adjusted = response_body.replace('\n', '')
            View_AppendLogData(LogLevel.INFO, "HTTP response. Code: " + response_code + ". Body:\n" + response_body_adjusted);
        }
    };
    // prepare request
    HttpHandler.open(request_data["request_method"], request_data["request_url"], true);
    HttpHandler.setRequestHeader('Accept', 'application/json');
    HttpHandler.setRequestHeader("Content-type", 'application/json;charset=UTF-8');
    // evaluate methods and execute request
    if(request_data["request_method"] == "GET"){
        if(request_data["poll_checkbox"]){
            PollReqInterval = setInterval(function(){
                HttpHandler.open(request_data["request_method"], request_data["request_url"], true);
                HttpHandler.send();
            }, request_data["poll_secs"] * 1000);
        } 
        else {
            HttpHandler.send();
        }
    } 
    else if(request_data["request_method"] == "PUT" || request_data["request_method"] == "POST"){
        json_body = Utils_ConvertStrToJson(request_data["request_body"]);
        HttpHandler.send(json_body);
    }
}


//=======[ End of file ]=======================================================
