--[[
    Imports -- Required Libraries
]] --

local json = require("json")
local ao = require("ao")
local sqlite3 = require("lsqlite3")

-- Open the database
local db = db or sqlite3.open_memory()

-- Nodes Table Definition
ENCRYPTED_DATA = [[
    CREATE TABLE encrypted_data (
        id TEXT PRIMARY KEY,
        data_type VARCHAR(10) NOT NULL CHECK (data_type IN ('integer', 'string', 'boolean', 'date')),
        encrypted_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
]]

-- Function to Initialize the Database
function InitDb()
  db:exec(ENCRYPTED_DATA)    
end

function create_encrypted_data(id, data_type, encrypted_value)
    local stmt = db:prepare("INSERT INTO encrypted_data (id, data_type, encrypted_value) VALUES (?, ?, ?)")
    stmt:bind_values(id, data_type, encrypted_value)
    local result = stmt:step()
    stmt:finalize()

    if result == sqlite3.DONE then
        print("Data created successfully.")
    else
        print("Error creating data.")
    end
end

function read_encrypted_data(id)
    local db_stmt = db:prepare("SELECT id, data_type, encrypted_value, created_at FROM encrypted_data WHERE id = ?")
    if db_stmt then
        db_stmt:bind_values(id)
        local row = db_stmt:step()

        if row == sqlite3.ROW then
            local data = {
                id = db_stmt:get_value(0),
                data_type = db_stmt:get_value(1),
                encrypted_value = db_stmt:get_value(2),
                created_at = db_stmt:get_value(3)
            }
            print("Data found:", data.id, data.data_type, data.encrypted_value, data.created_at)
            db_stmt:finalize()
            return data
        else
            print("No data found with the given ID.")
            db_stmt:finalize()
            return nil
        end
    end
    return nil
end

function select_all_by_page(page, page_size)
    -- Calculate the offset based on the page number and page size
    local offset = (page - 1) * page_size
    
    -- Prepare the SQL query with LIMIT and OFFSET for pagination
    local stmt = db:prepare("SELECT * FROM encrypted_data ORDER BY created_at LIMIT ? OFFSET ?")
    stmt:bind_values(page_size, offset)
    
    -- Fetch results
    local results = {}
    for row in stmt:nrows() do
        table.insert(results, {
            id = row.id,
            data_type = row.data_type,
            encrypted_value = row.encrypted_value,
            created_at = row.created_at
        })
    end
    
    stmt:finalize()
    
    -- Return the results
    return results
end

InitDb()

-- Handler Definitions

Handlers.add(
    "CreateEncryptedData",
    Handlers.utils.hasMatchingTag("Action", "CreateEncryptedData"),
    function(msg)
        -- Parse the incoming message data
        local data = json.decode(msg.Data)
        
        -- Extract data fields
        local id = msg.Id
        local data_type = data.data_type
        local encrypted_value = data.encrypted_value

        -- Check that required fields are provided
        if not id or not data_type or not encrypted_value then
            ao.send({
                Target = msg.From,
                Data = json.encode({ error = "Missing required fields: id, data_type, or encrypted_value" })
            })
            return
        end

        -- Attempt to create the new encrypted data record
        create_encrypted_data(id, data_type, encrypted_value)

        -- Send success response back to the requester
        ao.send({
            Target = msg.From,
            Data = json.encode({ success = true, message = "Data created successfully." })
        })
    end
)

Handlers.add(
    "ReadEncryptedData",
    Handlers.utils.hasMatchingTag("Action", "ReadEncryptedData"),
    function(msg)
        -- Parse the incoming message data
        local data = json.decode(msg.Data)
        
        -- Extract the id
        local id = data.id

        -- Check that the required field 'id' is provided
        if not id then
            ao.send({
                Target = msg.From,
                Data = json.encode({ error = "Missing required field: id" })
            })
            return
        end

        -- Attempt to read the encrypted data record
        local result = read_encrypted_data(id)

        -- Check if the record was found
        if result then
            -- Send the retrieved data back to the requester
            ao.send({
                Target = msg.From,
                Data = json.encode({ success = true, data = result })
            })
        else
            -- Send an error response if the record was not found
            ao.send({
                Target = msg.From,
                Data = json.encode({ error = "No data found with the given ID" })
            })
        end
    end
)

Handlers.add(
    "PaginateEncryptedData",
    Handlers.utils.hasMatchingTag("Action", "PaginateEncryptedData"),
    function(msg)
        -- Parse the incoming message data
        local data = json.decode(msg.Data)
        
        -- Default to page 1 and page_size 10 if not provided
        local page = data.page or 1
        local page_size = data.page_size or 10

        -- Get paginated results from the database
        local paginated_data = select_all_by_page(page, page_size)

        -- Send the response back to the original requester
        ao.send(
            {
                Target = msg.From,
                Data = json.encode(paginated_data)
            }
        )
    end
)
