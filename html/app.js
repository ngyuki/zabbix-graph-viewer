var app = angular.module('App', ['ngCookies']);

app.constant('Zabbix', {
    url: '/zabbix',
});

app.constant('PeriodOptions', [
    { label: '1 day',   value: 60 * 60 * 24 },
    { label: '2 day',   value: 60 * 60 * 24 * 2 },
    { label: '3 day',   value: 60 * 60 * 24 * 3 },
    { label: '1 week',  value: 60 * 60 * 24 * 7 },
    { label: '2 week',  value: 60 * 60 * 24 * 14 },
    { label: '1 month', value: 60 * 60 * 24 * 30 },
    { label: '2 month', value: 60 * 60 * 24 * 60 },
    { label: '3 month', value: 60 * 60 * 24 * 90 },
    { label: '6 month', value: 60 * 60 * 24 * 180 },
    { label: '1 year',  value: 60 * 60 * 24 * 365 },
]);

app.factory('ZabbixApi', function ($http, $cookies, Zabbix) {
    var _rpcid = 0;

    return {
        call: function (method, params) {
            return $http({
                method: 'POST',
                url: Zabbix.url + '/api_jsonrpc.php',
                headers: {
                    'Content-type': 'application/json-rpc',
                },
                data: {
                    jsonrpc: '2.0',
                    method: method,
                    id: _rpcid++,
                    auth: $cookies.zbx_sessionid,
                    params: params,
                },
            });
        },
    };
});

app.controller('MainCtrl', function ($scope, Zabbix, ZabbixApi, PeriodOptions) {
    $scope.period_options = PeriodOptions;
    $scope.period = $scope.period_options[0];

    ZabbixApi.call('hostgroup.get', {
        output: 'extend',
        real_hosts: true,
    })
    .success(function (data) {
        $scope.hostgroups = data.result;
        $scope.hostgroup = $scope.hostgroups[0];
    });

    $scope.$watch('hostgroup', function (newVal) {
        if (newVal == null) {
            return;
        }
        ZabbixApi.call('graph.get', {
            output: 'extend',
            groupids: [newVal.groupid],
        })
        .success(function (data) {
            var objs = data.result.reduce(function(r, v){
                r[v.name] = v;
                return r;
            }, {});
            $scope.graphs = $.map(objs, function (v) { return [v] });
            $scope.graph = $scope.graphs[0];
        });
    });

    $scope.doGraphShow = function () {

        ZabbixApi.call('graph.get', {
            output: 'extend',
            groupids: [$scope.hostgroup.groupid],
            selectHosts: 'extend',
            filter: { name: $scope.graph.name },
        })
        .success(function (data) {
            $scope.images = data.result
            .sort(function (a, b) {
                if (a.hosts[0].host < b.hosts[0].host) {
                    return -1;
                } else if (a.hosts[0].host > b.hosts[0].host) {
                    return +1;
                } else {
                    return 0;
                }
            })
            .map(function (v) {
                var src = Zabbix.url + '/chart2.php?' + $.param({
                    graphid: v.graphid,
                    width: 800,
                    height: 200,
                    period: $scope.period.value,
                });
                var href = Zabbix.url + '/charts.php?' + $.param({
                    graphid: v.graphid
                });
                return {
                    src: src,
                    href: href,
                };
            });
        });
    };
});

app.directive('imageFade', function () {
    return {
        link: function(scope, element, attrs) {
            element.css('opacity', '0');
            element.bind('load' , function(ev){
                this.style.opacity = '1.0';
            });
        },
    };
});
