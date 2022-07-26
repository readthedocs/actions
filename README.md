# Add Read the Docs preview's link to Pull Requests

GitHub Action that automatically edits Pull Requests' descriptions with a link to documentation's preview on Read the Docs.

## Example

![Example of a description edited with a link to Read the Docs preview](docs/pull-request-example.png)

## How to use it


First, enable "Preview Documentation from Pull Requests" in your Read the Docs project by following this guide
https://docs.readthedocs.io/en/latest/pull-requests.html


After that, create a [GitHub Action](https://docs.github.com/en/actions) in your repository with the following content:

```yaml
# .github/workflows/documentation-links.yaml

name: Read the Docs Pull Request Preview
on:
  pull_request_target:
    types:
      - opened

permissions:
  pull-requests: write

jobs:
  documentation-links:
    runs-on: ubuntu-latest
    steps:
      - uses: readthedocs/readthedocs-preview@main
        with:
          project-slug: "readthedocs-preview"
```


Once you add this GitHub Action to your repository, next time anybody opens a Pull Request,
the description will be edited to include the link to Read the Docs' documentation preview.

> Note that _you have to_ replace `readthedocs-preview` with the `project-slug` for your own project.
> You can find it in your Read the Docs' projects page in the right side of the page under "Project Slug".


