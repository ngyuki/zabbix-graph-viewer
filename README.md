# Zabbix Graph Viewer

## Install

Clone this repository to any directory.

```
cd /path/to/
git clone https://github.com/ngyuki/zabbix-graph-viewer.git
```

Fix zabbix.conf in httpd.

```
vim /etc/httpd/conf.d/zabbix.conf
```

```
# >>> BEGIN YOUR APPEND
Alias /zabbix/view /path/to/zabbix-graph-viewer/html

<Directory "/path/to/zabbix-graph-viewer/html">
    Options all
    Require all granted
</Directory>
# <<< END YOUR APPEND

Alias /zabbix /usr/share/zabbix

 :
 :
```

Restart httpd.

```
systemctl restart httpd.service
```

Open your zabbix and login.

```
open http://your-zabbix.example.com/zabbix/
```

Open Zabbix Graph Viewer.

```
open http://your-zabbix.example.com/zabbix/view/
```

## Snapshot

![snapshot.gif](snapshot.gif)

