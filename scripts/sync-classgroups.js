const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://nut:Nut29122539@192.168.6.26:27017/ktltc_db?authSource=admin';

function standardizeClassGroupName(name) {
  if (!name) return "";
  let clean = name.trim();
  const stripped = clean.replace(/[\s\.-]+/g, "");
  const match = stripped.match(/^([ก-ฮa-zA-Z]+)(.*)$/);
  if (match) {
    const prefix = match[1];
    const rest = match[2];
    if (rest) {
      return `${prefix}.${rest}`;
    }
    return prefix;
  }
  return stripped;
}

async function main() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('ktltc_db');
    const usersColl = db.collection('users');

    console.log('Finding all users...');
    // We already synced all 3 fields, so we only need to look at groupCode
    const users = await usersColl.find({ role: 'student' }).toArray();
    console.log(`Found ${users.length} students.`);

    let updatedCount = 0;
    for (const user of users) {
      const gCode = user.groupCode || '';
      if (!gCode) continue;

      const formattedGroup = standardizeClassGroupName(gCode);

      if (gCode !== formattedGroup || user.classGroupId !== formattedGroup || user.classroomName !== formattedGroup) {
        await usersColl.updateOne(
          { _id: user._id },
          {
            $set: {
              groupCode: formattedGroup,
              classGroupId: formattedGroup,
              classroomName: formattedGroup
            }
          }
        );
        updatedCount++;
      }
    }
    console.log(`Successfully reformatted class groups for ${updatedCount} students.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected.');
  }
}

main();
