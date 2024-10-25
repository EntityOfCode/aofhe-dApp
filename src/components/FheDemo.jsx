
import React, { useState } from 'react'
import styles from './FheDemo.module.css'
import Loader from './Loader'
import {
    Othent 
  } from "@othent/kms";
  import {
    dryrun,
    message,
    createDataItemSigner
  } from '@permaweb/aoconnect';

  const appInfo = {
    name: "AO FHE DEMO",
    version: "1.0.0",
    env: "production",
  };

  const othent = new Othent({ appInfo, throwErrors: false });


const FheDemo  = () => {

    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [valueToEncrypt, setValueToEncrypt] = useState(0);
    const [encryptIntegerValueBlockId, setEncryptIntegerValueBlockId] = useState('');
    const [executionTimes, setExecutionTimes] = useState({});
    const [decryptedString, setDecryptedString] = useState(null);
    const [encryptIntegerParam1, setEncryptIntegerParam1] = useState('');
    const [encryptIntegerParam2, setEncryptIntegerParam2] = useState('');
    const [decryptedComputation, setDecryptedComputation] = useState(null);

    const logWithTimestamp = (tag, message) => {
        const timestamp = new Date().toISOString()
        console.timeLog(tag, `[${timestamp}] ${message}`)
    }

    const formatTime = (milliseconds) => {
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const ms = milliseconds % 1000;
    
        return `${hours}h ${minutes}m ${seconds}s ${ms}ms`;
      };

    const timeExecution = async (method, label) => {
        console.time(label);
        const start = performance.now();
        const result = await method();
        const end = performance.now();
        console.timeEnd(label);
        setExecutionTimes((prev) => ({ ...prev, [label]: formatTime(Math.round(end - start)) }));
        return result;
      };


    // connect/disconnect function
    const toggleConnection = () => {
        setLoading(true)
        if (isConnected) {
            ao_disconnect()
        } else {
            ao_connect()
        }
    }

   
   const getSinger = () => {
    const singer = Object.assign({}, othent, {
        getActiveAddress: () => 
            //@ts-ignore
            othentSinger.getActiveKey(),
        getAddress: () => 
            //@ts-ignore
            othentSinger.getActiveKey(),
        singer: 
        //@ts-ignore
        tx => othent.sign(tx),
        type: 'arweave'
      })
      return singer
    
    }
    const ao_connect = async () => {
        const res = await othent.connect();
        console.log("Connect,\n", res);
        setIsConnected(true)
        setLoading(false)
        console.log("Connected")
        // Add additional logic for establishing a connection if necessary
    }

    const ao_disconnect = async () => {
        const res = await othent.disconnect();
        console.log("Disconnect,\n", res);
        setIsConnected(false)
        setLoading(false)
        console.log("Disconnected")
        // Add additional logic for disconnecting if necessary
    }

    const storeEncryptedData = async (value) => {
        try {
            const walletSing = await getSinger()

          const messageId = await message({
            process: import.meta.env.VITE_APP_AO_FHE_STORAGE_ID,
            signer: createDataItemSigner(walletSing),
            // the survey as stringified JSON
            data: JSON.stringify(value),
            tags: [{ name: 'Action', value: 'CreateEncryptedData' }],
          });
      
          console.log(messageId);
      
          return messageId;
        } catch (error) {
          console.log(error);
          return "";
        }
      }

      const getEncryptedData = async (messageId) => {
        const txIn = await dryrun({
          process: import.meta.env.VITE_APP_AO_FHE_STORAGE_ID,
          data: JSON.stringify({id: messageId}),
          tags: [
            { name: 'Action', value: 'ReadEncryptedData' },
          ],
        });
      
        const encryption = JSON.parse(txIn.Messages[0].Data);
      
        return encryption.data;
      }
      
       

    // Function to encrypt an integer value
    const encryptIntegerValue = () => {

        const tag = 'Encrypt Integer Value'
        console.time(tag)
        setLoading(true)
        setTimeout(async function  () {
            try {
            if (isConnected) {
                await timeExecution(async () => {
                    const data = await timeExecution(async () => { 
                        try {
                            const txIn = await dryrun({
                              process: import.meta.env.VITE_APP_AO_FHE_PROCESSOR_ID,
                              data: valueToEncrypt + '',
                              tags: [
                                { name: 'Action', value: 'EncryptIntegerValue' },
                              ],
                            });
                            const data = txIn.Messages[0].Data + '';
                            console.log(data);
                            return data;
                          } catch (error) {
                            console.log(error);
                          }
                    }, 'dryRunEncryptIntegerValue');
                    await timeExecution(async () => { 
                        try {
                            const aoId = await storeEncryptedData({
                                data_type: "integer",
                                encrypted_value: data
                            })
                            setEncryptIntegerValueBlockId(aoId)
                          } catch (error) {
                            console.log(error);
                          }
    
                    }, 'storeEncryptedData');
                }, 'encryptInteger');
                logWithTimestamp(tag, 'Encrypted Integer Value: OK')
            }
        } finally {
            setLoading(false)
            console.timeEnd(tag)
        }
    }, 300)         
    }

    // Function to decrypt an integer value using a blockId
    const decryptIntegerValue = () => {
        const tag = 'Decrypt Integer Value'
        console.time(tag)
        setLoading(true)
        setTimeout(async function  () {
            try {
                await timeExecution(async () => {
                    
                        const data =
                        await timeExecution(async () => { return await getEncryptedData(encryptIntegerValueBlockId)}, 'findEncryptedData');
                        await timeExecution(async () => {
                            try {
                                const txOut = await dryrun({
                                    process: import.meta.env.VITE_APP_AO_FHE_PROCESSOR_ID,
                                    data: data.encrypted_value,
                                    tags: [
                                      { name: 'Action', value: 'DecryptIntegerValue' },
                                    ],
                                  });
                                  const result = txOut.Messages[0].Data + '';
                                  console.log(result);
                                  setDecryptedString(result)
                                } catch (error) {
                                  console.log(error);
                                }
          
                         }, 'dryRunDecryptIntegerValue');
                                      }, 'decryptIntegerValue');
                logWithTimestamp(tag, 'Decrypt Integer Value: OK')
        } finally {
            setLoading(false)
            console.timeEnd(tag)
        }
    }, 300) 
    }

    // Function to perform an addition on two encrypted values using their block IDs
    const computeAddOperationOnEncryptedData = () => {
        const tag = 'Run sum on integer blocks'
        console.time(tag)
        setLoading(true)
        setTimeout(async function  () {
            try {
                await timeExecution(async () => {
                    try {
                        const data1 =
                        await timeExecution(async () => { return await getEncryptedData(encryptIntegerParam1)}, 'findEncryptedDataParam1');
                        const data2 =
                        await timeExecution(async () => { return await getEncryptedData(encryptIntegerParam2)}, 'findEncryptedDataParam2');
                    
                        const computeData = await timeExecution(async () => { 
                            const txAddOperation = await dryrun({
                                process: import.meta.env.VITE_APP_AO_FHE_PROCESSOR_ID,
                                data: JSON.stringify({param_value_left: data1.encrypted_value, param_value_right: data2.encrypted_value}),
                                tags: [
                                  { name: 'Action', value: 'ComputeOperationOnEncryptedData' },
                                  { name: 'operation', value: 'add' },
                                ],
                              });
                              return txAddOperation.Messages[0].Data + "";

                        }, 'computeOperation' );
                        await timeExecution(async () => {
                            const txOut = await dryrun({
                                process: import.meta.env.VITE_APP_AO_FHE_PROCESSOR_ID,
                                data: computeData,
                                tags: [
                                  { name: 'Action', value: 'DecryptIntegerValue' },
                                ],
                              });
                              const result = txOut.Messages[0].Data + '';
                              console.log(result);
      
                            setDecryptedComputation(result)
    
                         }, 'decryptComputation');
                      } catch (error) {
                        console.log(error);
                      }
                                      }, 'computeOperationOnEncryptedData');
                logWithTimestamp(tag, 'Run sum on integer blocks: OK')
        } finally {
            setLoading(false)
            console.timeEnd(tag)
        }
    }, 300)     }

    return (
        <div className={styles.container_fhe}>
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div>
                    <p>
                        <b>AO FHE Block Process Id:</b> 
                        {import.meta.env.VITE_APP_AO_FHE_PROCESS_ID} &nbsp;
                        <a className={styles.a_fhe} target='_blank' rel="norefferer" href={'https://www.ao.link/#/entity/' + import.meta.env.VITE_APP_AO_FHE_PROCESS_ID}>View Process In AO</a>
                    </p>
                    </div>
                    <button onClick={toggleConnection} className={styles.button_fhe}>
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </button>
                    <div className={styles.encryption_container}>
                    <div>
                        <h2 className={styles.heading_fhe}>Encrypt Integers</h2>
                        <input
                            type="number"
                            value={valueToEncrypt}
                            onChange={(e) =>
                                setValueToEncrypt(parseInt(e.target.value))
                            }
                            className={styles.input_fhe}
                        />
                        <button
                            onClick={encryptIntegerValue}
                            disabled={loading || !isConnected}
                            className={styles.button_fhe}
                        >
                            Encrypt Value 
                        </button>
                        {encryptIntegerValueBlockId && <p>Encrypted Value: Generated Block Id {encryptIntegerValueBlockId}</p>}
                        {encryptIntegerValueBlockId && <a className={styles.a_fhe}  target='_blank' rel="norefferer" href={'https://www.ao.link/#/message/' + encryptIntegerValueBlockId}>View Encrypted Data</a>}
                        {executionTimes['dryRunEncryptIntegerValue'] && <p>Time of fhe process: {executionTimes['dryRunEncryptIntegerValue']}</p>}
                        {executionTimes['storeEncryptedData'] && <p>Time to store encrypted value: {executionTimes['storeEncryptedData']}</p>}
                        {executionTimes['encryptInteger'] && <p>Total Time: {executionTimes['encryptInteger']}</p>}
                    </div>  
                    <div>
                        <h2 className={styles.heading_fhe}>Decrypt Integer Value Block</h2>
                        <input
                            type="text"
                            value={encryptIntegerValueBlockId}
                            onChange={(e) => setEncryptIntegerValueBlockId(e.target.value)}
                            className={styles.input_fhe}
                        />
                        <button
                            onClick={decryptIntegerValue}
                            disabled={loading || !encryptIntegerValueBlockId}
                            className={styles.button_fhe}
                        >
                            Decrypt Integer Value
                        </button>
                        {decryptedString && <p>Value result: {decryptedString}</p>}
                        {executionTimes['findEncryptedData'] && <p>Time to find encrypted data in AO storage: {executionTimes['findEncryptedData']}</p>}
                        {executionTimes['dryRunDecryptIntegerValue'] && <p>Time to decrypt: {executionTimes['dryRunDecryptIntegerValue']}</p>}
                        {executionTimes['decryptIntegerValue'] && <p>Total Time: {executionTimes['decryptIntegerValue']}</p>}
                        </div>
                        </div>   
                        <div>
                        <h2 className={styles.heading_fhe}>Sum operation on Integer Value Block</h2>
                        <p>Block Id Sum parameter 1</p>
                        <input
                            type="text"
                            value={encryptIntegerParam1}
                            onChange={(e) => setEncryptIntegerParam1(e.target.value)}
                            className={styles.input_fhe}
                        />
                        <p>Block Id Sum parameter 2</p>
                        <input
                            type="text"
                            value={encryptIntegerParam2}
                            onChange={(e) => setEncryptIntegerParam2(e.target.value)}
                            className={styles.input_fhe}
                        />
                        <button
                            onClick={computeAddOperationOnEncryptedData}
                            disabled={loading || !encryptIntegerParam1 || !encryptIntegerParam2}
                            className={styles.button_fhe}
                        >
                            Decrypt Sum Block Integer Value
                        </button>
                        {decryptedComputation && <p>Value result: {decryptedComputation}</p>}
                        {executionTimes['findEncryptedDataParam1'] && <p>Find encrypted data block Id parameter 1 Time: {executionTimes['findEncryptedDataParam1']}</p>}
                        {executionTimes['findEncryptedDataParam2'] && <p>Find encrypted data block Id parameter 2 Time: {executionTimes['findEncryptedDataParam2']}</p>}
                        {executionTimes['computeOperation'] && <p>Time to run computation: {executionTimes['computeOperation']}</p>}
                        {executionTimes['decryptComputation'] && <p>Time to decrypt computation: {executionTimes['decryptComputation']}</p>}
                        {executionTimes['computeOperationOnEncryptedData'] && <p>Total Time: {executionTimes['computeOperationOnEncryptedData']}</p>}
                        </div>                                
                </>
            )}
        </div>        
    )
}

export default FheDemo
