
const fs = require("fs");
const request = require("superagent");
const credentials = require("../credentials");
const moment = require("moment");



const createRemainingWork = (base, date, timeSpend, username, issue) => {
    //2017-03-09
    return `${base}/rest/tempo-rest/1.0/worklogs/remainingEstimate/calculate/${issue}/${date}/${date}/${timeSpend}?username=${username}`
}

const createIssueQuery = (baseUrl, query) => {
    return `${baseUrl}/rest/tempo-rest/2.0/issues/picker/?username=&issueType=&actionType=logTime&query=${query}`;
};

const createLogUrl = (base, issue) => {
    //2017-03-09
    return `${base}/rest/tempo-rest/1.0/worklogs/${issue}`
}


module.exports = {
    QueryIssue: async (query) => {
        const config = await credentials.readConfig();
        const url = createIssueQuery(config.Jira_url, query);
        const creds = await credentials.read();
        let result = await request
            .get(url)
            .set("Authorization", `Basic ${creds}`)
            .accept('application/json');
        return result.body.group[0].item.map(item => {
            return {
                title: item.name,
                key: item.key
            }
        });
    },
    GetRemainingHour: async (date, timeSpend, issue) => {
        const config = await credentials.readConfig();
        const url = createRemainingWork(config.Jira_url, date, timeSpend, config.Username, issue);
        const creds = await credentials.read();
        let result = await request
            .get(url)
            .set("Authorization", `Basic ${creds}`)
            .accept("text/plain;charset=UTF-8")
            .then(res => res.text);


        return result;
    },
    LogTime: async (issue, date, remaning, time, comment) => {
        const dateParsed = moment(date);
        const config = await credentials.readConfig();
        const url = createLogUrl(config.Jira_url, issue);
        const creds = await credentials.read();
        try {
            await request.post(url)
                .set("Authorization", `Basic ${creds}`)
                .set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
                .send({
                    id: '',
                    type: '',
                    'use-ISO8061-week-numbers': 'true',
                    ansidate: dateParsed.format("YYYY-MM-DD"),
                    ansienddate: dateParsed.subtract(1, 'days').format("YYYY-MM-DD"),
                    'selected-panel': 0,
                    'analytics-origin-page': 'TempoUserBoard',
                    'analytics-origin-view': 'timesheet',
                    'analytics-origin-action': 'Clicked+Log+Work+Button',
                    'analytics-page-category': '',
                    'startTimeEnabled': false,
                    'actionType': 'logTime',
                    tracker: false,
                    planning: false,
                    user: config.Username,
                    issue: issue,
                    date: dateParsed.format("DD/MMM/YY"),
                    enddate: dateParsed.subtract(1, 'days').format("DD/MMM/YY"),
                    time: time,
                    remainingEstimate: remaning,
                    comment: comment
                })

        } catch (error) {
            throw error;
        }
    }
}