import { hieracicalMarkdownSplitter, loadSource, splitDocs } from './dataloader'
import racesdata from './data/rulebook-01-races-srd'
import classesdata from './data/rulebook-02-classes-srd'

describe('should test dataloader', () => {
  it('should test dataloader', async () => {
    const result = await loadSource({
      idProvider: () => 'some-test-id-matching-schema'
    })
    expect(result).toMatchSnapshot()
  })

  it('test v2', async () => {
    const result = await splitDocs()
    const res = result.map((item: any) => {
      return { ...item, parentSlice: null }
    })

    const largeDocs = res
      .filter((item: any) => item.data.length > 1000)
      .sort((a: any, b: any) => a.data.length - b.data.length)
    console.log('large docs: ' + largeDocs.length)
    console.log('all docs: ' + res.length)
    // expect(largeDocs).toMatchSnapshot()

    expect(
      result
        .filter((item: any) => !item.children)
        .sort((a: any, b: any) => a.startInDoc - b.startInDoc)
        .map((item: any) => item.data)
        .join('\n---xxx---\n')
    ).toMatchSnapshot()

    expect(
      res.sort((a: any, b: any) => a.data.length - b.data.length)
    ).toMatchSnapshot()
    expect({
      length: res.length,
      lengthGreater1000: largeDocs.length
    }).toMatchSnapshot()
  })

  it('create readable output', async () => {
    const res = await hieracicalMarkdownSplitter()

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
    const text = [racesdata, classesdata].join('')
    const res = await hieracicalMarkdownSplitter({ data: text })

    expect(text.length).toBe(res.map(item => item.pageContent).join('').length)

    expect(res.map(item => item.pageContent).join('')).toEqual(text)
  })
})
