from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ServerSelectionTimeoutError
import certifi
import pprint

uri = "mongodb+srv://TheRealceCream:xijj69DyfnQOXD9d@cluster0.xvcs7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'), serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())

try:
    
    db = client["YouTube-Dashboard"]
    collection = db["everything"]

    # Fetch the first document in the collection
    information = collection.find_one()['229202']

    if first_document:
        print("First document in the collection:")
        pprint.pprint(first_document)
    else:
        print("No documents found in the collection.")


except ServerSelectionTimeoutError as e:
    print(f"Unable to connect to the MongoDB server. Error: {e}")
    print("Please check your internet connection and the MongoDB URI.")

finally:
    client.close()
