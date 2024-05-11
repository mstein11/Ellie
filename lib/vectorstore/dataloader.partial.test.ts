import { hieracicalMarkdownSplitter, loadSource, splitDocs } from './dataloader'
import racesdata from './data/rulebook-01-races-srd'
import classesdata from './data/rulebook-02-classes-srd'

describe('should test dataloader', () => {
  it('create readable output', async () => {
    const text = [racesdata, classesdata].join('\n')
    const res = await hieracicalMarkdownSplitter({ data: text })

    const largeDocs = res
      .filter(item => item.pageContent.length > 1000)
      .sort((a, b) => a.pageContent.length - b.pageContent.length)

    const smallDocs = res
      .filter(item => item.pageContent.length < 100)
      .sort((a, b) => a.pageContent.length - b.pageContent.length)

    console.log('small docs: ' + smallDocs.length)
    console.log('large docs: ' + largeDocs.length)
    console.log('all docs: ' + res.length)
    // expect(largeDocs).toMatchSnapshot()

    expect(
      largeDocs.map(item => {
        return { ...item, metadata: { ...item.metadata, id: undefined  } }
      })
    ).toMatchSnapshot()

    expect(
      res.map(item => (item.metadata.parentHeadings?.join("") ?? "") + item.pageContent).join('\n---xxx---\n')
    ).toMatchSnapshot()
  })

  it('input should match output', async () => {
    const text = [racesdata, classesdata].join('\n')
    const res = await hieracicalMarkdownSplitter({ data: text })

    expect(text.length).toBe(res.map(item => item.pageContent).join('').length)

    expect(res.map(item => item.pageContent).join('')).toEqual(text)
  })
})
