--[[
    Imports
]] --

local json = require("json")
local ao = require("ao")
local Tfhe = require("eoc_tfhe")

Name = Name or "EntityOfCode AO FHE Demo"

Tfhe.info()
Tfhe.generateSecretKey()

--[[
  utils helper functions
]]
--

--[[
     EncryptIntegerValue
   ]]
--
Handlers.add(
    "EncryptIntegerValue",
    Handlers.utils.hasMatchingTag("Action", "EncryptIntegerValue"),
    function(msg)
        local local_s = Tfhe.encryptInteger(msg.Data, "key")
        if local_s then
            ao.send(
                {
                    Target = msg.From,
                    Tags = {
                        Action = "StoreEncryptedData"
                    },
                    Data = local_s
                }
            )
        end
    end
)

--[[
     DecryptIntegerValue
   ]]
--
Handlers.add(
    "DecryptIntegerValue",
    Handlers.utils.hasMatchingTag("Action", "DecryptIntegerValue"),
    function(msg)
        local local_s = Tfhe.decryptInteger(msg.Data, "key")
        if local_s then
            ao.send(
                {
                    Target = msg.From,                    
                    Data = local_s
                }
            )
        end
    end
)

--[[
     ComputeOperationOnEncryptedData
   ]]
--
Handlers.add(
    "computeOperationOnEncryptedData",
    Handlers.utils.hasMatchingTag("Action", "ComputeOperationOnEncryptedData"),
    function(msg)
        if(msg.Tags.operation == "add") then
            local data = json.decode(msg.Data)
            local local_s = Tfhe.addCiphertexts(data.param_value_left, data.param_value_right, "key")
            ao.send({
                    Target = msg.From,
                    Data = local_s
                })        
        else 
            ao.send( {
                Target = msg.From,
                Data = "Operation not supported"
            })
        end
    end
)