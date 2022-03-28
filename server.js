import express from 'express'
import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

import { list_accounts } from "./services/mxapi-accounts.js"
import { getcredentialdetails, list_institutions } from "./services/mxapi-institutions.js"
import { createmember, listmembers, read_member_status, updatemember } from "./services/mxapi-members.js"
import { create_user, delete_user, find_member, list_users } from "./services/mxapi-users.js"

dotenv.config()
var port = process.env.PORT || 3000;

const __filename = fileURLToPath(
    import.meta.url)
const __dirname = path.dirname(__filename)

var app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.set("view engine", "ejs")

app.get('/', function (request, response) {
    console.log(request.method + " " + request.url)
    response.sendFile(__dirname + '/public/index.html')
})

app.get('/institutions', async function (request, response) {
    console.log(request.method + " " + request.url)

    const institutionresponse = await list_institutions()
    const usersresponse = await list_users()

    response.render('institutions', {
        institutions: institutionresponse.institutions,
        users: usersresponse.users,
        foundmember: undefined,
        selectedinstitution: undefined,
        selecteduser: undefined
    })
})

//siteuser clicked the "search" button after selecting a user from the drop-down
app.post('/member', async function (request, response) {
    console.log(request.method + " " + request.url)

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    let selecteduser = request.body[request.body.selectedinstitution + '_user']
    let foundmember = await find_member(selecteduser, request.body.selectedinstitution)

    //refreshing the user list that populates drop downs
    const usersresponse = await list_users()

    //use the list of institutions that was returned with the initial search
    let institutions = extractInstitutionsFromRequest(request.body)

    response.render('institutions', {
        foundmember: foundmember,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        selecteduser: selecteduser,
        users: usersresponse.users,
        accounts: undefined,
        credentials: undefined
    })
})


//siteuser clicked the "connect an account"/add icon after searching for existing members & finding no members
app.post('/credentials', async function (request, response) {
    console.log(request.method + " " + request.url)

    let credentials = null
    let selecteduser = null

    if (request.body.selectedinstitution != undefined) {
        selecteduser = request.body[request.body.selectedinstitution + '_user']
        const credentialsresponse = await getcredentialdetails(request.body.selectedinstitution)
        credentials = credentialsresponse.credentials
    }

    //refreshing the user list that populates drop downs
    const usersresponse = await list_users()

    //use the list of institutions that was returned with the initial search
    let institutions = extractInstitutionsFromRequest(request.body)

    response.render('institutions', {
        credentials: credentials,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        selecteduser: selecteduser,
        users: usersresponse.users,
        accounts: undefined,
        foundmember: undefined
    })
})

//siteuser clicked the "connect" button after entering credentials
app.post('/connect', async function (request, response) {
    console.log(request.method + " " + request.url)

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    let selecteduser = request.body[request.body.selectedinstitution + '_user']

    //double check
    let foundmember = await find_member(selecteduser, request.body.selectedinstitution)

    if (foundmember.length == 0) {
        foundmember = await createmember(request.body.selectedinstitution, selecteduser,
            request.body.credential0_guid, request.body.credential0_entry,
            request.body.credential1_guid, request.body.credential1_entry)

        console.log("CREATED " + foundmember.guid)
    }


    //refreshing the user list that populates drop downs
    const usersresponse = await list_users()

    //use the list of institutions that was returned with the initial search
    let institutions = extractInstitutionsFromRequest(request.body)

    response.render('institutions', {
        foundmember: foundmember,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        selecteduser: selecteduser,
        users: usersresponse.users,
        accounts: undefined,
        credentials: undefined
    })

})

app.post('/accounts', async function (request, response) {
    console.log(request.method + " " + request.url)

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    const selecteduser = request.body[request.body.selectedinstitution + '_user']

    const accountresponse = await list_accounts(selecteduser)

    //double check
    let foundmember = await find_member(selecteduser, request.body.selectedinstitution)

    //refreshing the user list that populates drop downs
    const usersresponse = await list_users()

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body)


    console.log(accountresponse)

    response.render('institutions', {
        accounts: accountresponse.accounts,
        foundmember: foundmember,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        selecteduser: selecteduser,
        users: usersresponse.users
    })

})

/* USERLESS ******************************************************************/

app.get('/userless/onetime', async function (request, response) {
    console.log(request.method + " " + request.url)

    const institutionresponse = await list_institutions()

    response.render('userless', {
        institutions: institutionresponse.institutions,
        selectedinstitution: '',
        accounts: undefined,
        member: undefined,
        user: undefined
    })
})

app.post('/userlesscredentials', async function (request, response) {
    console.log(request.method + " " + request.url)
    let client_user_id = request.body.client_user_id

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    let credentials = null

    if (request.body.selectedinstitution != undefined) {
        const credentialsresponse = await getcredentialdetails(request.body.selectedinstitution)
        credentials = credentialsresponse.credentials
    }

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body, 3)

    let target = 'userless'
    if (request.body.client_user_id) {
        target = 'semiuserless'
    } else if (request.body.targettemplate) {
        target = request.body.targettemplate
    }

    response.render(target, {
        client_user_id: client_user_id,
        credentials: credentials,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        accounts: undefined,
        member: undefined,
        user: undefined
    })

})

app.post('/userlessconnect', async function (request, response) {
    console.log(request.method + " " + request.url)
    let client_user_id = request.body.client_user_id

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    let institution = request.body.selectedinstitution
    let user_id = 'USERLESS-' + institution + '_' + request.body.credential0_entry

    let newuser = await create_user(user_id, '', client_user_id)
    let newmember = ''

    if (newuser.response && newuser.response.status == 409) {
        let allusers = await list_users()

        for (let i = 0; i < allusers.users.length; i++) {
            if (allusers.users[i].id == user_id) {
                newuser = allusers.users[i]
                break
            }
        }
        newmember = await find_member(newuser.guid, institution)
        newmember = await updatemember(newmember.guid, newmember.user_guid,
            request.body.credential0_guid, request.body.credential0_entry,
            request.body.credential1_guid, request.body.credential1_entry)
        newmember = await read_member_status(newmember.user_guid, newmember.guid)
        newmember.institution_code = institution
        newmember.user_guid = newuser.guid


    }
    else {
        newmember = await createmember(request.body.selectedinstitution, newuser.guid,
            request.body.credential0_guid, request.body.credential0_entry,
            request.body.credential1_guid, request.body.credential1_entry)
    }

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body, 3)
    response.render('userless', {
        institutions: institutions,
        member: newmember,
        selectedinstitution: request.body.selectedinstitution,
        user: newuser.guid,
        accounts: undefined,
        credentials: undefined
    })
})

app.post('/userlessrefreshstatus', async function (request, response) {
    console.log(request.method + " " + request.url)

    const newmember = await read_member_status(request.body.userguid, request.body.memberguid)
    newmember.institution_code = request.body.selectedinstitution
    newmember.user_guid = request.body.userguid

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body, 3)
    response.render('userless', {
        institutions: institutions,
        member: newmember,
        selectedinstitution: request.body.selectedinstitution,
        user: request.body.userguid,
        accounts: undefined,
        credentials: undefined
    })
})

app.post('/userlessaccounts', async function (request, response) {
    console.log(request.method + " " + request.url)
    console.log(request.body)

    if (request.body.selecteduser == null) {
        console.error("missing user")
        response.redirect('/')
    }

    let accountresponse = await list_accounts(request.body.selecteduser)

    if (accountresponse.accounts.length == 0) {
        const member_status = await read_member_status(request.body.selecteduser, request.body.memberguid)

        if (member_status.connection_status == 'CREATED') {
            await new Promise(r => setTimeout(r, 3500))
            accountresponse = await list_accounts(request.body.selecteduser)
        }
    }

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body, 3)

    response.render('userless', {
        accounts: accountresponse.accounts,
        institutions: institutions,
        selectedinstitution: request.body.selectedinstitution,
        user: request.body.selecteduser,
        member: undefined,
        credentials: undefined
    })
})

app.get('/userless/withclientuserid', async function (request, response) {
    console.log(request.method + " " + request.url)

    const institutionresponse = await list_institutions()

    response.render('semiuserless', {
        client_user_id: '',
        institutions: institutionresponse.institutions,
        selectedinstitution: '',
        accounts: undefined,
        member: undefined,
        user: undefined
    })
})

app.get('/userless/persist', async function (request, response) {
    console.log(request.method + " " + request.url)

    const institutionresponse = await list_institutions()

    response.render('userlessthenpersist', {
        institutions: institutionresponse.institutions,
        selectedinstitution: '',
        accounts: undefined,
        member: undefined,
        user: undefined
    })
})

app.post('/userlesscanaryconnect', async function (request, response) {
    console.log(request.method + " " + request.url)
    let client_user_id = request.body.client_user_id

    if (request.body.selectedinstitution == null) {
        console.error("missing institution")
        response.redirect('/')
    }

    let institution = request.body.selectedinstitution
    let user_id = 'USERLESS-' + institution + '_' + request.body.credential0_entry

    let newuser = await create_user(user_id, '', client_user_id)
    let newmember = ''

    if (newuser.response && newuser.response.status == 409) {

        //CREATE a canary user - make sure they connect before potentially breaking the existing user
        let temp_user_id = 'USERLESS-' + institution + '_' + request.body.credential0_entry + '_' + Date.now()
        let canaryuser = await create_user(temp_user_id, '', client_user_id)
        let canarymember = await createmember(institution, canaryuser.guid,
            request.body.credential0_guid, request.body.credential0_entry,
            request.body.credential1_guid, request.body.credential1_entry)

        if (canarymember.connection_status == 'CREATED') {
            await new Promise(r => setTimeout(r, 3500))
            canarymember = await read_member_status(canaryuser.guid, canarymember.guid)
        }

        if (canarymember.connection_status == 'CONNECTED') {
            //FIND the conflicting user & member, and update the member with these (good) creds
            let allusers = await list_users()

            for (let i = 0; i < allusers.users.length; i++) {
                if (allusers.users[i].id == user_id) {
                    newuser = allusers.users[i]
                    break
                }
            }
            newmember = await find_member(newuser.guid, institution)
            console.log("Updating " + newuser.id + " with creds")
            newmember = await updatemember(newmember.guid, newmember.user_guid,
                request.body.credential0_guid, request.body.credential0_entry,
                request.body.credential1_guid, request.body.credential1_entry)
            newmember = await read_member_status(newmember.user_guid, newmember.guid)
            newmember.institution_code = institution
            newmember.user_guid = newuser.guid

            //we can delete the canaryuser & canarymember here
        }
        else {
            console.log(canarymember.connection_status)
            newmember = canarymember
            newmember.institution_code = institution
            newmember.user_guid = canaryuser.guid
            newuser = canaryuser
        }
    }
    else {
        newmember = await createmember(request.body.selectedinstitution, newuser.guid,
            request.body.credential0_guid, request.body.credential0_entry,
            request.body.credential1_guid, request.body.credential1_entry)
    }

    //use the list of institutions that was returned with the initial search
    const institutions = extractInstitutionsFromRequest(request.body, 3)
    response.render('userless', {
        institutions: institutions,
        member: newmember,
        selectedinstitution: request.body.selectedinstitution,
        user: newuser.guid,
        accounts: undefined,
        credentials: undefined
    })
})

/* ETC ******************************************************************/

app.get('/user', async function (request, response) {
    console.log(request.method + " " + request.url)

    const userresponse = await list_users()

    response.render('users', {
        users: userresponse.users,
        action: 'create',
        error: ''
    })
})

app.post('/user', async function (request, response) {
    console.log(request.method + " " + request.url)

    const newuser = await create_user(request.body.user_id, request.body.user_email, request.body.client_user_id)

    let redirect = '/users'
    if (newuser.response && newuser.response.status == 409) {
        redirect = redirect + '?error=409'
    }
    response.redirect(redirect)
})

app.get('/users', async function (request, response) {
    console.log(request.method + " " + request.url)

    const userresponse = await list_users()


    for (let i = 0; i < userresponse.users.length; i++) {
        let memberresponse = await listmembers(userresponse.users[i].guid)
        userresponse.users[i].members = memberresponse.members
    }

    response.render('users', {
        users: userresponse.users,
        action: 'read',
        error: request.query.error
    })
})

app.post('/users', async function (request, response) {
    console.log(request.method + " " + request.url)

    await delete_user(request.body.user_guid)

    response.redirect('/users')
})

function extractInstitutionsFromRequest(requestbody, divisor) {
    if (divisor == undefined) {
        divisor = 4
    }

    const institutionCount = Object.keys(requestbody).length / divisor

    let institutions = []

    for (var i = 0; i < institutionCount - 1; i++) {
        institutions.push({
            "small_logo_url": requestbody['institution' + i + 'small_logo_url'],
            "code": requestbody['institution' + i + 'code'],
            "name": requestbody['institution' + i + 'name']
        })
    }
    return institutions
}

var listener = app.listen(port, function () {
    console.log('miro is listening on port ' + listener.address().port)
    console.log('we will use this auth: ' + process.env.BASIC_AUTH_TOKEN)
})
