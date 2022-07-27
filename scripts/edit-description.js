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
    var RTD_URL = `https://${RTD_PROJECT_SLUG}--${PR_NUMBER}.${RTD_DOMAIN}/${RTD_PROJECT_LANGUAGE}/${PR_NUMBER}/`;

    var MESSAGE_SEPARATOR_START = `<!-- readthedocs-preview ${RTD_PROJECT_SLUG} start -->\n`;
    var MESSAGE_SEPARATOR_END = `\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} end -->`;
    var MESSAGE_TEMPLATE = inputs["message-template"];

    const { data: pull } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
    });

    var body_message = MESSAGE_TEMPLATE.replace("{docs-pr-index-url}", RTD_URL);

    var body = "";
    if (pull.body) {
        body = pull.body.slice(0, pull.body.indexOf(MESSAGE_SEPARATOR_START));
        body = body + MESSAGE_SEPARATOR_START + body_message + MESSAGE_SEPARATOR_END;
        body = body + pull.body.slice(pull.body.indexOf(MESSAGE_SEPARATOR_END) + MESSAGE_SEPARATOR_END.length);
    }

    github.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        body: body,
    });
}
