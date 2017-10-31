
-- "name"
-- : "SurgiPalProd",
--             "server": "52.168.172.30",
--             "port": 3306,
--             "database": "surgipal_master",
--             "username": "root",
--             "password":"1&&o2qokof2L",
--             "dialect": "MySQL"


select count(*) from UserData
select * from UserData
select * from Log
delete from UserData

select * from UserInfo
select * from BillingSendData
select * from surgery

select * from surgery where id=1666

select * from surgeriesview where doctorFosID =180

update surgery set cancelled=0,completed=0 where id in (1666,
1473,
1390)