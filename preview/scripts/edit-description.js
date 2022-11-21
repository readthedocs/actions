module.exports = async ({inputs, github, context}) => {
    var PR_NUMBER = context.issue.number;
    var RTD_PROJECT_SLUG = inputs["project-slug"];
    var RTD_PROJECT_LANGUAGE = inputs["project-language"];
    var RTD_PLATFORM = inputs["platform"];
    if (RTD_PLATFORM == "community") {
        var RTD_DOMAIN = "org.readthedocs.build";
    }
    if (RTD_PLATFORM == "business") {
        var RTD_DOMAIN = "com.readthedocs.build";
    }
    var RTD_DOMAIN = `https://${RTD_PROJECT_SLUG}--${PR_NUMBER}.${RTD_DOMAIN}/`;
    if (RTD_SINGLE_VERSION == "true") {
        RTD_URL = RTD_DOMAIN + `${RTD_PROJECT_LANGUAGE}/${PR_NUMBER}/`;
    } else {
        RTD_URL = RTD_DOMAIN; 
    }

    var MESSAGE_SEPARATOR_START = `\r\n\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} start -->\r\n`;
    var MESSAGE_SEPARATOR_END = `\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} end -->`;
    var MESSAGE_TEMPLATE = inputs["message-template"];

    const { data: pull } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
    });

    var body_message = MESSAGE_TEMPLATE.replace("{docs-pr-index-url}", RTD_URL);

    var body = "";
    if (pull.body) {
        if (pull.body.indexOf(MESSAGE_SEPARATOR_START) == -1) {
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
