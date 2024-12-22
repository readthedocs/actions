# Add Read the Docs preview's link to Pull Requests

GitHub Action that automatically edits Pull Requests' descriptions with a link to documentation's preview on Read the Docs.

## Example

![Example of a description edited with a link to Read the Docs preview](pull-request-example.png)

## How to use it


First, enable "Preview Documentation from Pull Requests" in your Read the Docs project by following this guide
https://docs.readthedocs.io/en/latest/pull-requests.html


After that, create a [GitHub Action](https://docs.github.com/en/actions) in your repository with the following content:

```yaml
# .github/workflows/documentation-links.yml

name: readthedocs/actions
on:
  pull_request_target:
    types:
      - opened
    # Execute this action only on PRs that touch
    # documentation files.
    # paths:
    #   - "docs/**"

jobs:
  documentation-links:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: readthedocs/actions/preview@v1
        with:
          project-slug: "readthedocs-preview"
```


Once you add this GitHub Action to your repository, next time anybody opens a Pull Request,
the description will be edited to include the link to Read the Docs' documentation preview.

> Note that **_you have to_ replace `readthedocs-preview` with the `project-slug` for your own project**.
> You can find it in your Read the Docs' projects page in the right side of the page under "Project Slug".


## Configuration

These are all the parameters this action supports:
* `project-slug` (**_required_**): Project's slug on Read the Docs. You can find it on your Read the Docs project's details page in the right menu under "Project Slug".
* `project-language` (_optional_): Project's language code on Read the Docs. Example: `en` for English, `es` for Spanish, etc. (default: `en`)
* `message-template` (_optional_): Text message to be injected by the action in the Pull Request description. It supports the following placeholders to be replaced:
  * `{docs-pr-index-url}`: URL to the root of the documentation for the Pull Request preview.
* `platform` (_optional_): Read the Docs Community (`community`) or Read the Docs for Business (`business`). (default: `community`)
* `single-version` (_optional_): Set this to `'true'` if your project is single version, so we can link to the correct URL. (default: `'false'`)
