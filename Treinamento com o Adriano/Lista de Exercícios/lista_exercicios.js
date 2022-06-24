
//Exercício 1
var employeeSearchObj = search.create({
    type: "employee",
    filters:[],
    columns:
    [
        search.createColumn({name: "altname", label: "Nome"}),
        search.createColumn({name: "datecreated", label: "Data de criação"}),
        search.createColumn({name: "email", label: "E-mail"})
    ]
    });

//Exercício 3
var employeeSearchObj = search.create({
    type: "employee",
    filters:
    [
       ["datecreated","within","01/01/2022 0:00","31/12/2022 23:59"]
    ],
    columns:
    [
       search.createColumn({name: "altname", label: "Nome"}),
       search.createColumn({name: "datecreated", label: "Data de criação"}),
       search.createColumn({name: "email", label: "E-mail"})
    ]
});
var searchResultCount = employeeSearchObj.runPaged().count;
log.debug("employeeSearchObj result count",searchResultCount);
employeeSearchObj.run().each(function(result){
// .run().each has a limit of 4,000 results
return true;
});

//Exercício 5
var employeeSearchObj = search.create({
    type: "employee",
    filters:
    [
       ["email","haskeywords","runsmart"]
    ],
    columns:
    [
       search.createColumn({name: "altname", label: "Nome"}),
       search.createColumn({name: "datecreated", label: "Data de criação"}),
       search.createColumn({name: "email", label: "E-mail"})
    ]
 });
 var searchResultCount = employeeSearchObj.runPaged().count;
 log.debug("employeeSearchObj result count",searchResultCount);
 employeeSearchObj.run().each(function(result){
    // .run().each has a limit of 4,000 results
    return true;
 });
 
 //Exercício 7 8 9 

 var transactionSearchObj = search.create({
    type: "transaction",
    filters:
    [
       ["datecreated","within","thismonth"], 
       "AND", 
       ["item.type","anyof","Service"]
    ],
    columns:
    [
       search.createColumn({
          name: "datecreated",
          sort: search.Sort.DESC,
          label: "Data de criação"
       }),
       search.createColumn({name: "entity", label: "Nome"}),
       search.createColumn({name: "item", label: "Item"}),
       search.createColumn({name: "total", label: "Valor (total da transação)"})
    ]
 });
 var searchResultCount = transactionSearchObj.runPaged().count;
 log.debug("transactionSearchObj result count",searchResultCount);
 transactionSearchObj.run().each(function(result){
    // .run().each has a limit of 4,000 results
    return true;
 });