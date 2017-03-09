#!/usr/bin/env node
const prog = require('caporal');
const fs = require("fs");
const credentials = require("./credentials");
const jira = require("./jira");
const myProgVersion = require('./package.json').version;
const prompt = require('prompt');
const moment = require("moment");

const prompter = (questions) => {
    return new Promise((resolved, rejected) => {
        prompt.start();
        prompt.get(questions, function (err, result) {
            if (err) { return rejected(err) }
            return resolved(result)
        });
    });
}

prog
    .version(myProgVersion)
    .description('A cli for Tempo time reg')
    .command('init', 'initialize cli')
    .action((args, options, logger) => {
        credentials.Prompt()
            .then(credentials.store)
            .then(res => logger.info(`Written your config to ${res}`))
            .catch(result => logger.error(result));
    })
    .command("log-time", "For logging time in tempo")
    .option('--issue <issue>', 'name of issue', null, null, true)
    .option('--time <time>', 'time to log', prog.FLOAT, null, true)
    .option('--date <date>', 'date formatted as YYYY-MM-DD', null, moment().format('YYYY-MM-DD'), false )
    .option('--comment <comment>', 'the log comment, will default to "Time logged"', null, "Time logged", false)
    .action(async (args, options, logger) => {        
        var issues = await jira.QueryIssue(options.issue);
        if (issues.length > 1) {
           throw new Error("Use a more precise issue key")
        }
       
        var issue = issues[0];       
        var timeRemaning =await jira.GetRemainingHour(options.date, options.time, issue.key);
        try {
            logger.info(`Issue: ${issue}`)
            logger.info(`Time: ${options.time}`)
            logger.info(`Comment: ${options.comment}`)
            logger.info(`Time Remaining: ${timeRemaning}`)
            logger.info(`Date: ${options.date}`)
            await jira.LogTime(issue.key, options.date, timeRemaning, options.time, options.comment)
        } catch (error) {
            logger.error(error)
        }
    });

prog.parse(process.argv);

