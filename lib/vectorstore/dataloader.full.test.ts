import { loadSource, loadSourceV2 } from './dataloader'

describe('should test dataloader', () => {
  it('should test dataloader', async () => {
    const result = await loadSource({
      idProvider: () => 'some-test-id-matching-schema'
    })
    expect(result).toMatchSnapshot()
  })

  it('test v2 - full', async () => {
    const res = await loadSourceV2()

    const largeDocs = res
      .filter(item => item.pageContent.length > 1000)
      .sort((a, b) => a.pageContent.length - b.pageContent.length)

    expect(largeDocs.length).toBe(314); // some are allowed to be longer, mainly tables

    expect(
      res
        .map(
          item =>
            item.pageContent
        )
        .join('\n---xxx---\n')
    ).toMatchSnapshot()
  })
})
