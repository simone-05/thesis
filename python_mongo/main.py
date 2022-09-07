import signal
import time
import pymongo

def handler(signum, frame):
    print("\nExiting..")
    exit()
 
signal.signal(signal.SIGINT, handler)

myclient = pymongo.MongoClient("mongodb://mongo:27017")
mydb = myclient["iot"]
mycol = mydb["test"]

while 1:
    device_id = input("device_id: ")
    add = 'y'
    metrics = []
    while add == 'y':
        metric_name = input("metric name: ")
        metric_value = float(input("metric value (float): "))
        metrics.append({"name": metric_name, "float_value": metric_value})
        add = input("Add another metric? y/n\n>")
        while (add != 'y' and add !='n'):
            add = input("\ty/n ?\n>")

    if (not device_id):
        print("Not inserted")
        continue

    mydict = { "device_id": device_id, "metric": metrics, "timestamp": str(int(time.time()))}

    x = mycol.insert_one(mydict)
    print("Inserted")

 
