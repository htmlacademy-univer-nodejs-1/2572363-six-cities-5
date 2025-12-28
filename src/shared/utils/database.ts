export function getMongoURI(
  username: string,
  password: string,
  host: string,
  port: string,
  databaseName: string
): string {
  if (!username || !password || !host || !port || !databaseName) {
    throw new Error('Missing required database connection parameters');
  }

  return `mongodb://${username}:${password}@${host}:${port}/${databaseName}?authSource=admin`;
}
