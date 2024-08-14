module.exports = async ({ inputs, github, context }) => {
    const PR_NUMBER = context.issue.number;
    const RTD_PROJECT_SLUG = inputs["project-slug"];
    const RTD_PLATFORM = inputs["platform"];

    let RTD_DOMAIN = "";
    let RTD_URL = "";
    let RTD_PROJECT_ENDPOINT = "";

    if (RTD_PLATFORM === "community") {
        RTD_DOMAIN = "org.readthedocs.build";
        RTD_PROJECT_ENDPOINT = `https://readthedocs.org/api/v3/projects/${RTD_PROJECT_SLUG}/`;
    } else if (RTD_PLATFORM === "business") {
        RTD_DOMAIN = "com.readthedocs.build";
        RTD_PROJECT_ENDPOINT = `https://readthedocs.com/api/v3/projects/${RTD_PROJECT_SLUG}/`;
    } else {
        // Log warning here?
    }
    const RTD_PROJECT_DOMAIN = `https://${RTD_PROJECT_SLUG}--${PR_NUMBER}.${RTD_DOMAIN}/`;

    // Get project details from the RTD API
    const project = await fetch(RTD_PROJECT_ENDPOINT, {}).catch((error) => {
        throw new Error(`Failed to fetch project details from Read the Docs API: ${error}`);
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed to fetch project details from Read the Docs API: ${project.statusText}`);
        }
        return response.json();
    });

    if (project.versioning_scheme === "single_version_without_translations") {
        RTD_URL = RTD_PROJECT_DOMAIN;
    } else if (project.versioning_scheme === "multiple_versions_with_translations") {
        RTD_URL = RTD_PROJECT_DOMAIN + `${project.language.code}/${PR_NUMBER}/`;
    } else if (project.versioning_scheme === "multiple_versions_without_translations") {
        RTD_URL = RTD_PROJECT_DOMAIN + `${PR_NUMBER}/`;
    }

    const MESSAGE_SEPARATOR_START = `\r\n\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} start -->\r\n`;
    const MESSAGE_SEPARATOR_END = `\r\n<!-- readthedocs-preview ${RTD_PROJECT_SLUG} end -->`;
    const MESSAGE_TEMPLATE = inputs["message-template"];

    const { data: pull } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
    });

    const body_message = MESSAGE_TEMPLATE.replace("{docs-pr-index-url}", RTD_URL);

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
