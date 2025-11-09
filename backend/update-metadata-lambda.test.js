const { handler } = require('./update-metadata-lambda');
const { S3Client, CopyObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { mockClient } = require('aws-sdk-client-mock');

const s3Mock = mockClient(S3Client);

describe('Update Metadata Lambda', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  it('should update metadata successfully', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: { id: 'test-image.jpg' },
      body: JSON.stringify({
        title: 'New Title',
        description: 'New Description',
        category: 'New Category',
        tags: 'new, tags',
      }),
    };

    s3Mock.on(HeadObjectCommand).resolves({ Metadata: { originalname: 'test.jpg' } });
    s3Mock.on(CopyObjectCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe('Metadata updated successfully');

    const copyCommand = s3Mock.calls()[1].args[0];
    expect(copyCommand.input.Metadata.title).toBe('New Title');
  });

  it('should return 500 on S3 error', async () => {
    const event = {
      httpMethod: 'PUT',
      pathParameters: { id: 'test-image.jpg' },
      body: JSON.stringify({ title: 'New Title' }),
    };

    s3Mock.on(HeadObjectCommand).rejects(new Error('S3 Error'));

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to update metadata');
  });
});
