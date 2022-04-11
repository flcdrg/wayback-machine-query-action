# Wayback machine query GitHub Action

[![build-test](https://github.com/flcdrg/wayback-machine-query-action/actions/workflows/test.yml/badge.svg)](https://github.com/flcdrg/wayback-machine-query-action/actions/workflows/test.yml)

Allows querying Archive.org's Wayback Machine to locate URLs for archived web pages.

The action makes use of the [Wayback Machine Availability API](https://archive.org/help/wayback_api.php)

The input file format is assumed to follow that produced by [lychee](https://github.com/lycheeverse/lychee) (e.g. as can be produced by the [lycheeverse/lychee-action](https://github.com/lycheeverse/lychee-action) GitHub action).

If the `replacements-path` input property is set, then a file is written in JSON format. The data includes a list (`missing`) of any URLs that did not have snapshots, and a list (`replacements`) with pairs of the original URL and a corresponding Wayback Machine URL. You could use this data to do a find/replace in the source document(s).

The `missing` and `replacement` value are also set as output properties.

If a timestamp is supplied to the Wayback Machine API, then the closest snapshot to that date is returned. The timestamp is obtained via a regular expression that is applied to the input URL. The regular expression must at least return a named group `year`, and optionally `month` and `day`. See the tests for an example.

## Motivation

I was looking at adding automated accessibility checking to my blog. In doing this, I discovered I'd accrued a lot of broken links over the years, and these seem to be impacting the accessibility scanning tool.
Adding [lycheeverse/lychee-action](https://github.com/lycheeverse/lychee-action) was useful, but it generated a long list of broken links, and I figured there must be a way to automate the fixing of many of the broken links.

## Usage

```yaml
- uses: flcdrg/wayback-machine-query-action@v1
  id: wayback
  with:
    source-path:        # path to input JSON file
    replacements-path:  # (Optional) path to output JSON file
    timestamp-regex:    # (Optional) regex to extract a timestamp from the input URL
```

### Sample input file

```json
{
    "fail_map": {
      "./_posts/2005/2005-03-30-server-and-domain-isolation-using.md": [
        {
          "url": "http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx#EGAA",
          "status": "Timeout"
        }
      ],
      "./_posts/2009/2009-03-30-sas-and-typeperf.md": [
        {
          "url": "http://technet.microsoft.com/en-us/library/cc753182.aspx",
          "status": "Failed: Network error"
        },
        {
          "url": "http://www.sqlserver.org.au/",
          "status": "Timeout"
        },
        {
          "url": "http://www.microsoft.com/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true",
          "status": "Timeout"
        }
      ]
    }
  }
```

### Sample output file

```json
{
  "missing": [
    "http://www.sqlsnapshots.com/SQLSnapshotsMP3Feed.xml",
  ],
  "replacements": [
    {
      "find": "http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx#EGAA",
      "replace": "http://web.archive.org/web/20050404133316/http://www.microsoft.com:80/windowsserver2003/technologies/networking/ipsec/default.mspx",
    },
    {
      "find": "http://www.sqlserver.org.au/",
      "replace": "http://web.archive.org/web/20090217192805/http://www.sqlserver.org.au:80/",
    },
    {
      "find": "http://www.microsoft.com/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true",
      "replace": "http://web.archive.org/web/20091206231445/http://www.microsoft.com:80/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true",
    },
  ],
}
```
