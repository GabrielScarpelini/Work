/**
* @NScriptType ClientScript
* @NApiVersion 2.0
* @Authors Rafael Oliveira & Gabriel Pavia
*/
define(['N/log', 'N/ui/dialog'], function(log, dialog){
    /**
     * a função saveRecord precisa de um retorno true or false
     * true (deixa salvar)
     * false (não deixa salvar)
     */
        function saveRecord(ctx){ // função que será executada ao salvar
            log.debug('ctx: ', ctx)
            log.debug('Type: ', ctx.currentRecord.type)
            var type = ctx.currentRecord.type
            var registro = ctx.currentRecord
            try{
                if (type == 'customrecord1452'){
                    var horasTotaisTrabalhadas = registro.getValue('custrecord_rsc_horasatuadas_rafael')  // pega o valor do campo Horas atuadas
                    var horasFaturaveis = registro.getValue('custrecord_apontamento_alocadascampo') 
                    var textFaturaveis = 'Horas faturáveis'
                    var textTotais = 'Horas totais trabalhadas'

                    var retornando1 = requisisoes(horasTotaisTrabalhadas, textTotais)
                    var retornando2 = requisisoes(horasFaturaveis, textFaturaveis)

                    if (retornando1 == true && retornando2 == true){
                        return true
                    }else{
                        return false
                    }
                }
                else{
                    var horasFaturaveisCaso = registro.getValue('custevent_horas_faturaveis')
                    var textFaturaveis = 'Horas faturáveis'
                    var retornando = requisisoes(horasFaturaveisCaso, textFaturaveis)
                    
                    return retornando
                    
                }
            }catch(e){ // recebe um erro 
                log.debug('Erro', e)  // mostra o erro
            }
        }

        function requisisoes(Horas, nome){
            var virgula = Horas.indexOf(',') 
            var horas = Horas.slice(0, virgula)
            var minutos = Horas.slice(virgula +1)
            // >>>>>>>>>>>>>>   Mensagens de erro <<<<<<<<<<<<<<<
            var ErroLimite = {
                title: 'Você está fora da quantidade padrão de caracteres!!!',
                message: 'Campo: ' +  nome + '</p> </p> min: 2  max: 5 caracteres.</p> Exemplo:</p> 0,5 == 30 minutos </p> 1,0 == 1 hora </p> 1,5 == 1 hora e 30 minutos </p> 2,0 == 2 horas </p> Limite: 999,5 == 999 horas e 30 minutos.'
            }
            var ErroLetra = {
                title: 'Você inseriu caracteres inválidos!!!',
                message: 'Campo: ' +  nome + '</p> </p> Forneça apenas números e uma vírgula.</p> Exemplo:</p> 0,5 == 30 minutos </p> 1,0 == 1 hora </p> 1,5 == 1 hora e 30 minutos </p> 2,0 == 2 horas'
            }
            var ErroTipo = {
                title: 'O formato está inválido!!!',
                message: 'Campo: ' +  nome + '</p> </p> Os minutos precisam ser mostrados como 0 ou 5. Digite as horas de acordo com o seguinte exemplo: 0,5 == 30 minutos </p> 1,0 == 1 hora </p> 1,5 == 1 hora e 30 minutos </p> 2,0 == 2 horas'
            }
            // >>>>>>>>>>>>>>>>> condicionais para verificação do campo <<<<<<<<<<<<<<<<<<<
            if(Horas){  // se tiver algo nele, faça:   
                if (Horas.length > 5 || Horas.length < 3){
                    dialog.alert(ErroLimite)
                    return false
                }
                else if (minutos != Number(minutos) || horas != Number(horas)){
                    dialog.alert(ErroLetra)
                    return false
                }
                else if((Number(minutos) == 5 || Number(minutos) ==0) && (Horas[1] == ',' || Horas[2] == ',' || Horas[3] == ',')){ // confere se são números e se tem o dois pontos
                    return true // deixa salvar

                }else{ 
                    dialog.alert(ErroTipo) // usa a mensagem de erro da linha 26
                    return false // não deixa salvar
                }
            }else{ // se o campo estiver vazio, deixa salvar 
                return true // deixa salvar
            }
        }
    
        return{
            saveRecord: saveRecord
        }
    })