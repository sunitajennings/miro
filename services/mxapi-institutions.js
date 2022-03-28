import fetch from 'node-fetch'
import { constants } from './mxapi.js'

export async function getcredentialdetails(institution_code) {
    console.log("GET " + constants().mx_base_url + "/institutions/" + institution_code + "/credentials")

    try {
        const credentialsresponse = await fetch(constants().mx_base_url + '/institutions/' + institution_code + "/credentials", {
            method: 'GET',
            headers: constants().mx_api_headers
        }).then(response => {
            return response.json()
        })
        console.log(credentialsresponse)
        return credentialsresponse

    } catch (error) {
        console.error(error)
        return error
    }
}

export async function list_institutions() {
    console.log("GET " + constants().mx_base_url + "/institutions")

    try {
        const institutionresponse = await fetch(constants().mx_base_url + '/institutions', {
            method: 'GET',
            headers: constants().mx_api_headers
        }).then(response => {
            return response.json()
        })
        //console.log(institutionresponse)
        return institutionresponse

    } catch (error) {
        console.error(error)
        return error
    }
}