//globals
var mx_base_url = 'https://int-api.mx.com'

var mx_api_headers = {
    'Accept': 'application/vnd.mx.api.v1+json',
    'Authorization': process.env.BASIC_AUTH_TOKEN,
    'Content-Type': 'application/json'
}

export class HTTPResponseError extends Error {
    constructor(response, ...args) {
        super(`HTTP Error Response: ${response.status} ${response.statusText}`, ...args);
        this.response = response;
    }
}

export function constants() {
    return {
        mx_base_url: mx_base_url,
        mx_api_headers: mx_api_headers
    }
}