module.exports = async ({inputs, github, context}) => {
    const PR_NUMBER = context.issue.number;
    const RTD_PROJECT_SLUG = inputs["project-slug"];
    const RTD_PROJECT_LANGUAGES = inputs["project-language"].split("\n");
    const RTD_PLATFORM = inputs["platform"];
    const RTD_SINGLE_VERSION = inputs["single-version"];

    github.log.debug(`Language: ${inputs["project-language"]}`);

    let RTD_DOMAIN = "";
    let RTD_URL = "";

    if (RTD_PLATFORM === "community") {
        RTD_DOMAIN = "org.readthedocs.build";
    } else if (RTD_PLATFORM === "business") {
        RTD_DOMAIN = "com.readthedocs.build";
    } else {
        // Log warning here?
    }

    let RTD_URLS = [];

    if (RTD_SINGLE_VERSION === "true") {
        RTD_URL = RTD_PROJECT_DOMAIN;
        RTD_URLS.push(RTD_URL);
    } else {
        for (let i = 0; i < RTD_PROJECT_LANGUAGES.length; i++) {
            const RTD_PROJECT_LANGUAGE = RTD_PROJECT_LANGUAGES[i];
            const RTD_PROJECT_DOMAIN = `https://${RTD_PROJECT_SLUG}--${PR_NUMBER}.${RTD_DOMAIN}/`;

            RTD_URL = RTD_PROJECT_DOMAIN + `${RTD_PROJECT_LANGUAGE}/${PR_NUMBER}/`;
            if (RTD_PROJECT_LANGUAGES.length > 1) {
                RTD_URL = "\r\n* " + RTD_URL;
            }
            RTD_URLS.push(RTD_URL);
        }
    }


    const MESSAGE_SEPARATOR_START = `\r\n\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} start -->\r\n`;
    const MESSAGE_SEPARATOR_END = `\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} end -->`;
    const MESSAGE_TEMPLATE = inputs["message-template"];

    const { data: pull } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
    });


    const body_message = MESSAGE_TEMPLATE.replace("{docs-pr-index-url}", RTD_URLS.join(''));

    let body = "";
    if (pull.body) {
        if (pull.body.indexOf(MESSAGE_SEPARATOR_START) === -1) {
            // First time updating this description
            body = pull.body + MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
        }
        else {
            // We already updated this description before
            body = pull.body.slice(0, pull.body.indexOf(MESSAGE_SEPARATOR_START));
            body = body + MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
            body = body + pull.body.slice(pull.body.indexOf(MESSAGE_SEPARATOR_END) + MESSAGE_SEPARATOR_END.length);
        }
    }
    else {
        // Pull Request description is empty
        body = MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
    }

    github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        body: body,
    });
}
