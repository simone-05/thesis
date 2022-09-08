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
        val_type = 0
        while val_type not in [1,2,3]:
            val_type = int(input("metric type? \t1.float 2.int 3.long\n>"))
        if (val_type == 1) :
            val_type = "float"
            metric_value = float(input("metric value: "))
        if (val_type == 2) :
            val_type = "int"
            metric_value = int(input("metric value: "))
        if (val_type == 3) :
            val_type = "long"
            metric_value = input("metric value: ")
        metrics.append({"name": metric_name, val_type+"_value": metric_value})
        add = input("Add another metric? y/n\n>")
        while (add != 'y' and add !='n'):
            add = input("\ty/n ?\n>")

    if (not device_id):
        print("Not inserted")
        continue

    mydict = { "device_id": device_id, "metric": metrics, "timestamp": str(int(time.time()))}

    x = mycol.insert_one(mydict)
    print("Inserted")

 
