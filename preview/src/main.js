const core = require('@actions/core');
const github = require('@actions/github');

async function main() {
    try {
        const PR_NUMBER = github.context.issue.number;
        const RTD_PROJECT_SLUG = core.getInput("project-slug");
        const RTD_PROJECT_LANGUAGE = core.getInput("project-language");
        const RTD_PLATFORM = core.getInput("platform");
        const RTD_SINGLE_VERSION = core.getInput("single-version");

        const octokit = github.getOctokit(core.getInput('github-token'))

        let RTD_DOMAIN = "";
        let RTD_URL = "";

        if (RTD_PLATFORM === "community") {
            RTD_DOMAIN = "org.readthedocs.build";
        } else if (RTD_PLATFORM === "business") {
            RTD_DOMAIN = "com.readthedocs.build";
        } else {
            // Log warning here?
        }
        const RTD_PROJECT_DOMAIN = `https://${RTD_PROJECT_SLUG}--${PR_NUMBER}.${RTD_DOMAIN}/`;

        if (RTD_SINGLE_VERSION === "true") {
            RTD_URL = RTD_PROJECT_DOMAIN;
        } else {
            RTD_URL = RTD_PROJECT_DOMAIN + `${RTD_PROJECT_LANGUAGE}/${PR_NUMBER}/`;
        }

        const MESSAGE_SEPARATOR_START = `\r\n\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} start -->\r\n`;
        const MESSAGE_SEPARATOR_END = `\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} end -->`;
        const MESSAGE_TEMPLATE = core.getInput("message-template");

        const {data: pull} = await octokit.rest.pulls.get({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
        });

        const body_message = MESSAGE_TEMPLATE.replace("{docs-pr-index-url}", RTD_URL);

        let body = "";
        if (pull.body) {
            if (pull.body.indexOf(MESSAGE_SEPARATOR_START) === -1) {
                // First time updating this description
                body = pull.body + MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
            } else {
                // We already updated this description before
                body = pull.body.slice(0, pull.body.indexOf(MESSAGE_SEPARATOR_START));
                body = body + MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
                body = body + pull.body.slice(pull.body.indexOf(MESSAGE_SEPARATOR_END) + MESSAGE_SEPARATOR_END.length);
            }
        } else {
            // Pull Request description is empty
            body = MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
        }

        await octokit.rest.pulls.update({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            pull_number: github.context.issue.number,
            body: body,
        });
    } catch (err) {
        core.setFailed(err.message);
    }
}

main();
