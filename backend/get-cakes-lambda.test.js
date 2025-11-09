const { handler } = require('./get-cakes-lambda');
const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('Get Cakes Lambda', () => {
  beforeEach(() => {
    S3Client.prototype.send.mockReset();
    getSignedUrl.mockReset();
  });

  it('should return a list of cakes with metadata', async () => {
    const mockContents = [
      { Key: 'cake1.jpg', LastModified: new Date(), Size: 1024 },
      { Key: 'cake2.jpg', LastModified: new Date(), Size: 2048 },
    ];

    const mockMetadata = {
      Metadata: {
        title: 'Chocolate Cake',
        description: 'A delicious chocolate cake.',
        category: 'cakes',
        tags: 'chocolate, cake',
        originalname: 'chocolate-cake.jpg',
      },
    };

    S3Client.prototype.send
      .mockResolvedValueOnce({ Contents: mockContents }) // For ListObjectsV2Command
      .mockResolvedValue(mockMetadata); // For HeadObjectCommand

    getSignedUrl.mockResolvedValue('https://s3.amazonaws.com/bucket/cake.jpg');

    const response = await handler({});

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe('Chocolate Cake');
  });

  it('should return an empty array if the bucket is empty', async () => {
    S3Client.prototype.send.mockResolvedValueOnce({ Contents: [] });

    const response = await handler({});

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('should return a 500 error if S3 fails', async () => {
    S3Client.prototype.send.mockRejectedValueOnce(new Error('S3 Error'));

    const response = await handler({});

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe('Failed to fetch cakes.');
  });
});
