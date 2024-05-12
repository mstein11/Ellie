import racesdata from './data/rulebook-01-races-srd'
import classesdata from './data/rulebook-02-classes-srd'
import { HierarchicalMarkdownTextSplitter } from './HierachicalMarkdownTextSplitter/HierarchicalMarkdownTextSplitter'

describe('should test dataloader', () => {
  it('create readable output', async () => {
    const text = [racesdata, classesdata]

    const hieracicalMarkdownSplitter = new HierarchicalMarkdownTextSplitter({
      idProvider: () => 'some-test-id-matching-schema'
    })
    const res = await hieracicalMarkdownSplitter.createDocuments(text)

    const largeDocs = res
      .filter(item => item.pageContent.length > 1000)
      .sort((a, b) => a.pageContent.length - b.pageContent.length)

    expect(
      largeDocs.map(item => {
        return { ...item, metadata: { ...item.metadata, id: undefined } }
      })
    ).toMatchSnapshot()

    expect(
      res
        .map(
          item =>
            (item.metadata.parentHeadings?.join('') ?? '') + item.pageContent
        )
        .join('\n---xxx---\n')
    ).toMatchSnapshot()
  })

  it('input should match output', async () => {
    const text = [racesdata, classesdata].join('\n')

    const hieracicalMarkdownSplitter = new HierarchicalMarkdownTextSplitter()
    const res = await hieracicalMarkdownSplitter.createDocuments([text])

    expect(text.length).toBe(res.map(item => item.pageContent).join('').length)

    expect(res.map(item => item.pageContent).join('')).toEqual(text)
  })
})
