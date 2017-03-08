const prompt = require('prompt');
const fs = require("fs");
const home = require('os').homedir();
const credentialsPath = `${home}/.jira-cli-config.json`;

module.exports = {
    Prompt: () => {
        return new Promise((resolved, rejected) => {
            prompt.start();
            prompt.get(['Username', 'Password', 'Jira_url'], function (err, result) {
                if (err) { return rejected(err) }
                return resolved(result)
            });
        });
    },
    store: (credentials) => {
        return new Promise((resolved, rejected) => {
            var json = JSON.stringify(credentials);
            fs.writeFile(credentialsPath, json, 'utf8', (err) => {
                if (err) { return rejected(err) }
                resolved(credentialsPath)
            });
        });
    },
    read: () => {
        return new Promise((resolved, rejected) => {
            fs.readFile(credentialsPath, (err, data) => {
                if (err) { return rejected(err) }
                const credentials = JSON.parse(data);
                resolved(new Buffer(`${credentials.Username}:${credentials.Password}`).toString('base64'))
            });
        });
    },
    readConfig: () => {
        const home = require('os').homedir();
        const credentialsPath = `${home}/.jira-cli-config.json`;
        return new Promise((resolved, rejected) => {
            fs.readFile(credentialsPath, (err, data) => {
                if (err) { return rejected(err) }
                const creds = JSON.parse(data);
                resolved(creds);
            });
        });
    }

};