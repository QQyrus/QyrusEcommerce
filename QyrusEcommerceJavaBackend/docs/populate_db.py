import os
import mysql.connector
import random

# Connect to MySQL using the same MYSQL_* env vars the backends use.
# Defaults match the local docker-compose setup; export real values to target another DB (e.g. prod RDS).
connect_kwargs = {
    "host": os.environ.get("MYSQL_HOST", "localhost"),
    "port": int(os.environ.get("MYSQL_PORT", "3307")),
    "user": os.environ.get("MYSQL_USER", "user"),
    "password": os.environ.get("MYSQL_PASSWORD", "password"),
    "database": os.environ.get("MYSQL_DATABASE_NAME", "ecommerce"),
}

# Optional TLS for connecting to AWS RDS: set MYSQL_SSL_CA to a PEM CA bundle path to enable it.
mysql_ssl_ca = os.environ.get("MYSQL_SSL_CA")
if mysql_ssl_ca:
    connect_kwargs["ssl_ca"] = mysql_ssl_ca
    connect_kwargs["ssl_verify_cert"] = True

connection = mysql.connector.connect(**connect_kwargs)
cursor = connection.cursor()
# Category-specific placeholder images using open source/free images
placeholder_images = {
    "Men": {
        "T-Shirts": [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1581655353564-df123a1eb820?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1484807/pexels-photo-1484807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3768005/pexels-photo-3768005.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1232459/pexels-photo-1232459.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2294342/pexels-photo-2294342.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        ],
        "Jeans": [
            "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1346187/pexels-photo-1346187.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1983925/pexels-photo-1983925.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2343661/pexels-photo-2343661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1604176424472-9d7122c67c3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1705667/pexels-photo-1705667.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1511196044526-5cb3bcb7071b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1261422/pexels-photo-1261422.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Shirts": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1589310243389-96a5483213a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1563630423918-b58f07336ac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764040/pexels-photo-6764040.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1598961942613-ba897716405b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764507/pexels-photo-6764507.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6975476/pexels-photo-6975476.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764043/pexels-photo-6764043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1604695573706-53170668f6a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311159/pexels-photo-6311159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ]
    },
    "Women": {
        "Dresses": [
            "https://images.unsplash.com/photo-1495385794356-15371f348c31?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1612336307429-8a898d10e223?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1375736/pexels-photo-1375736.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1631181/pexels-photo-1631181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1612722432474-b971cdcea546?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1078958/pexels-photo-1078958.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Tops": [
            "https://images.unsplash.com/photo-1519568470290-c0c1fbfff16f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/5480696/pexels-photo-5480696.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311372/pexels-photo-6311372.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1554568218-0f1715e72254?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311659/pexels-photo-6311659.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311612/pexels-photo-6311612.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1602573991155-21f0143d2111?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311160/pexels-photo-6311160.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311615/pexels-photo-6311615.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603487742131-4160ec999306?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311378/pexels-photo-6311378.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311158/pexels-photo-6311158.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311650/pexels-photo-6311650.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603217192634-61068e4d4bf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6311651/pexels-photo-6311651.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Skirts": [
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1577900232427-18219b8349fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764509/pexels-photo-6764509.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764508/pexels-photo-6764508.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1582142306909-195724d0a735?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764506/pexels-photo-6764506.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764505/pexels-photo-6764505.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1592301933927-35b597393c0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764504/pexels-photo-6764504.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764503/pexels-photo-6764503.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764502/pexels-photo-6764502.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764501/pexels-photo-6764501.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/6764500/pexels-photo-6764500.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ]
    },
    "Kids": {
        "Toys": [
            "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1558060370-d644485927b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1767434/pexels-photo-1767434.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3933281/pexels-photo-3933281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1584822764034-33524aaf921e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3661264/pexels-photo-3661264.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1560859251-d563a49c37dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3661197/pexels-photo-3661197.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1563901935883-cb9fb1991acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3661196/pexels-photo-3661196.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/3661194/pexels-photo-3661194.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1517348161284-8286b5f0c376?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        ],
        "Clothing": [
            "https://images.unsplash.com/photo-1522771930-78848d9293e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/35188/child-childrens-baby-children-s.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1519457431-44ccd64a579b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1619801/pexels-photo-1619801.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1519238359922-989348752efb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620765/pexels-photo-1620765.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620766/pexels-photo-1620766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1555009393-f20bdb245c4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620770/pexels-photo-1620770.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620771/pexels-photo-1620771.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1534499673348-58454447c525?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620772/pexels-photo-1620772.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620773/pexels-photo-1620773.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1620774/pexels-photo-1620774.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Books": [
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1471970394675-613138e45da3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/264635/pexels-photo-264635.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1005324/literature-book-open-pages-1005324.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1553729459-efe14ef6055d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2128249/pexels-photo-2128249.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1005012/pexels-photo-1005012.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2465877/pexels-photo-2465877.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ]
    },
    "Accessories": {
        "Watches": [
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/277390/pexels-photo-277390.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/236915/pexels-photo-236915.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2113994/pexels-photo-2113994.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/280250/pexels-photo-280250.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1034063/pexels-photo-1034063.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2494608/pexels-photo-2494608.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Bags": [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/934673/pexels-photo-934673.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1575891467811-070df21bd04a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/2081199/pexels-photo-2081199.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1591561954557-26941169b49e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1102777/pexels-photo-1102777.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1547949003-9792a18a2601?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1306248/pexels-photo-1306248.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ],
        "Jewelry": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1616096/pexels-photo-1616096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1413420/pexels-photo-1413420.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1232931/pexels-photo-1232931.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1395306/pexels-photo-1395306.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1603561596112-0a132b757442?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1616096/pexels-photo-1616096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
        ]
    }
}
# Default placeholder image
default_placeholder = "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"

# Product categories
product_categories = {
    "Men": ["T-Shirts", "Jeans", "Shirts"],
    "Women": ["Dresses", "Tops", "Skirts"],
    "Kids": ["Toys", "Clothing", "Books"],
    "Accessories": ["Watches", "Bags", "Jewelry"]
}

colors = [
    {"name": "Red", "hex": "#FF0000"},
    {"name": "Blue", "hex": "#0000FF"},
    {"name": "Green", "hex": "#008000"},
    {"name": "Yellow", "hex": "#FFFF00"},
    {"name": "Black", "hex": "#000000"},
    {"name": "Pink", "hex": "#FFC0CB"}
]
sizes = ["S", "M", "L", "XL"]
providers = ["Provider A", "Provider B", "Provider C", "Provider D"]

gibberish_descriptions = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere.",
    "Curabitur lacinia felis vel justo fringilla, non elementum est congue.",
    "Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
    "Donec ultricies sem a arcu vehicula, id tincidunt massa posuere.",
    "Fusce varius ligula sed ex convallis, nec accumsan risus blandit.",
    "Aliquam erat volutpat. Cras interdum nisl non erat tempor gravida.",
    "Etiam convallis metus eget augue sodales, vel varius justo aliquam.",
    "Nulla facilisi. Integer pulvinar lorem id sapien faucibus tincidunt.",
    "Suspendisse quis lacus sed orci eleifend volutpat ac nec lectus."
]

# Insert products into the database
product_id = 1
for category, subcategories in product_categories.items():
    for subcategory in subcategories:
        for _ in range(20):
            category_images = placeholder_images.get(category, {})
            subcategory_images = category_images.get(subcategory, [default_placeholder])
            random_image = random.choice(subcategory_images)

            product_name = f"{category[:-1]}'s {subcategory[:-1]} {product_id}"
            price = random.randint(50, 500)
            image = random_image
            description = random.choice(gibberish_descriptions)
            rating = random.randint(1, 5)

            cursor.execute("""
                INSERT INTO products (name, price, image, category, subcategory, description, rating)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (product_name, price, image, category, subcategory, description, rating))

            connection.commit()
            current_product_id = cursor.lastrowid

            selected_colors = random.sample(colors, random.randint(1, len(colors)))
            selected_sizes = random.sample(sizes, random.randint(1, len(sizes)))
            selected_providers = random.sample(providers, random.randint(1, len(providers)))

            for color in selected_colors:
                cursor.execute("""
                    INSERT INTO product_colors (product_id, hex, name)
                    VALUES (%s, %s, %s)
                """, (current_product_id, color["hex"], color["name"]))

            for size in selected_sizes:
                cursor.execute("""
                    INSERT INTO product_sizes (product_id, sizes)
                    VALUES (%s, %s)
                """, (current_product_id, size))

            for provider in selected_providers:
                cursor.execute("""
                    INSERT INTO product_providers (product_id, providers)
                    VALUES (%s, %s)
                """, (current_product_id, provider))

            # Comments
            comments = ["Great product!", "Highly recommend.", "Would buy again.",
                        "Good value for money.", "Excellent quality.", "Stylish and comfortable.",
                        "Not satisfied.", "Could be better.", "Not worth the price.",
                        "Product is okay.", "Don't buy this", "Waste of money"]
            num_comments = random.randint(1, 3)
            selected_comments = random.sample(comments, num_comments)

            for comment in selected_comments:
                cursor.execute("""
                    INSERT INTO product_comments (product_id, comments)
                    VALUES (%s, %s)
                """, (current_product_id, comment))

            connection.commit()
            product_id += 1

print("Products added successfully.")

cursor.close()
connection.close()
