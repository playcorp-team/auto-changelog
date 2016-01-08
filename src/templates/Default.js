// The default template attempts to follow the schema from
// https://github.com/olivierlacan/keep-a-changelog

export default class Default {
  logHeader = '# Change Log\nAll notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).\n\nGenerated by [auto-changelog](https://github.com/CookPete/auto-changelog)'

  unreleasedTitle = 'Unreleased'
  mergesTitle = 'Merged'
  fixesTitle = 'Fixed'
  commitsTitle = 'Commits'

  commitListLimit = 3
  commitHashLength = 7
  minimumChangeCount = 1 // Minimum number of merges/fixes/commits to show per release

  sectionSpacing = '\n\n\n'
  listSpacing = '\n\n'

  constructor (origin) {
    this.origin = origin
  }

  render = (releases) => {
    return [
      this.logHeader,
      releases.map(this.renderRelease).join(this.sectionSpacing)
    ].join(this.sectionSpacing) + '\n'
  }

  renderRelease = (release, index, releases) => {
    const previousRelease = releases[index + 1]
    let log = [ this.renderReleaseHeading(release, previousRelease) ]
    const merges = this.renderMerges(release.merges)
    const fixes = this.renderFixes(release.fixes)
    log = log.concat(merges).concat(fixes)
    const backfillCount = this.minimumChangeCount - (release.merges.length + release.fixes.length)
    if (backfillCount > 0) {
      log = log.concat(this.renderCommits(release.commits, backfillCount))
    }
    return log.join(this.listSpacing)
  }

  renderReleaseHeading = (release, previousRelease) => {
    const title = this.renderReleaseTitle(release, previousRelease)
    const date = release.date ? ' - ' + this.formatDate(release.date) : ''
    return `## ${title}${date}`
  }

  renderReleaseTitle = (release, previousRelease) => {
    let heading = release.tag || this.unreleasedTitle
    if (previousRelease) {
      heading = `[${heading}](${this.origin}/compare/${previousRelease.tag}...${release.tag || 'HEAD'})`
    }
    return heading
  }

  renderList = (title, list) => {
    const heading = title ? `### ${title}\n` : ''
    return heading + list
  }

  renderMerges = (merges) => {
    if (merges.length === 0) return []
    const list = merges.map(merge => {
      const href = merge.pr.replace('#', this.origin + '/pull/')
      return this.renderMerge({
        message: merge.message,
        link: `[\`${merge.pr}\`](${href})`
      })
    }).join('\n')
    return this.renderList(this.mergesTitle, list)
  }

  renderMerge = ({ message, link }) => {
    return `* ${message} ${link}`
  }

  renderFixes = (fixes) => {
    if (fixes.length === 0) return []
    const list = fixes
      .map(fix => this.renderFix({
        commit: fix.commit,
        links: fix.fixes.map(this.renderFixLink)
      }))
      .join('\n')
    return this.renderList(this.fixesTitle, list)
  }

  renderFix = ({ links, commit }) => {
    return `* ${commit.subject} ${links.join(', ')}`
  }

  renderFixLink = (string) => {
    const href = string.replace('#', this.origin + '/issues/')
    const number = string.replace(this.origin + '/issues/', '#')
    return `[\`${number}\`](${href})`
  }

  renderCommits = (commits, limit) => {
    if (commits.length === 0) return []
    limit = Math.min(limit, this.commitListLimit)
    const list = commits
      .sort(this.sortCommits)
      .slice(0, limit)
      .map(commit => this.renderCommit({
        subject: commit.subject,
        link: this.renderCommitLink(commit)
      }))
      .join('\n')
    return this.renderList(this.commitsTitle, list)
  }

  renderCommit = ({ subject, link }) => {
    return `* ${subject} ${link}`
  }

  renderCommitLink = ({ hash }) => {
    const shortHash = hash.slice(0, this.commitHashLength)
    const href = `${this.origin}/commit/${hash}`
    return `[\`${shortHash}\`](${href})`
  }

  sortCommits = (a, b) => {
    // If we have to list commits, list the juicy ones first
    return b.insertions + b.deletions - a.insertions + a.deletions
  }

  formatDate = (date) => {
    return date.slice(0, 10)
  }
}
