const MongoClient = require('mongodb').MongoClient;
var equal = require('deep-equal');

const rui_a = "mongodb://a:b@server-a";
const rui_b = "mongodb://a:b@server-b";

async function main() {
  const clientA = new MongoClient(rui_a);
  const clientB = new MongoClient(rui_b);

  await clientA.connect()
  await clientB.connect()

  const dbA = clientA.db('mydbname')
  const dbB = clientB.db('mydbname')

  const collectionsA = await dbA.listCollections().toArray()
  console.log('A', collectionsA)
  const collectionsB = await dbB.listCollections().toArray()
  console.log('B', collectionsB)

  const collections = collectionsA
  const counts = {}
  for (const c of collections) {
    console.log('collection', c)
    const collectionA = dbA.collection(c)
    const collectionsB = dbB.collection(c)
    const cursor = collectionA.find({})
    counts[c] = 0
    for await(const doc of cursor) {
      let docB;
      if (doc._id) {
        docB = await collectionB.findOne({_id: doc._id})
      }
      if (!equal(doc, docB)) {
        counts[c] += 1;
        console.log('A', JSON.stringify(doc))
        console.log('B', JSON.stringify(docB))
        console.log('-----')
      }
    }

  }
  console.log(counts)
  await clientA.close()
  await clientB.close()
}

main().catch(console.error)
