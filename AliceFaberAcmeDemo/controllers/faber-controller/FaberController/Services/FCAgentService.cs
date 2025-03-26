using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using FaberController.Enums;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace FaberController.Services
{
    public class FCAgentService
    {
        public FCAgentService(HttpClient http)
        {
            _http = http;
        }

        private HttpClient _http { get; }

        public async Task<AgentStatus> GetStatus()
        {
            try
            {
                var response = await _http.GetAsync("/status");
                response.EnsureSuccessStatusCode();
                return AgentStatus.Up;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return AgentStatus.Down;
            }
        }

        public async Task<JArray> GetConnections()
        {
            try
            {
                var response = await _http.GetAsync("/connections");
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var jsonResponse = JObject.Parse(responseString);
                return jsonResponse.Value<JArray>("results");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JArray();
            }
        }

        public async Task<JObject> RemoveConnection(string connectionId)
        {
            if (string.IsNullOrEmpty(connectionId))
            {
                Console.Error.WriteLine("Must provide a connection ID");
                return new JObject();
            }

            try
            {
                // Correct endpoint for removing a connection
                var response = await _http.DeleteAsync($"/connections/{connectionId}");
                response.EnsureSuccessStatusCode();

                // Read and parse the response
                var responseString = await response.Content.ReadAsStringAsync();
                return !string.IsNullOrEmpty(responseString) ? JObject.Parse(responseString) : new JObject();
            }
            catch (HttpRequestException httpEx)
            {
                Console.Error.WriteLine($"HTTP Request Error: {httpEx.Message}");
                return new JObject();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error: {ex.Message}");
                return new JObject();
            }
        }

        public async Task<JObject> CreateInvitation()
        {
            try
            {
            // Define the request payload
            var invitationRequest = new
            {
                handshake_protocols = new[] { "https://didcomm.org/didexchange/1.1" }
            };

            // Serialize the payload to JSON
            var content = new StringContent(JsonConvert.SerializeObject(invitationRequest), Encoding.UTF8, "application/json");

            // Send the POST request to the /out-of-band/create-invitation endpoint
            var response = await _http.PostAsync("/out-of-band/create-invitation", content);
            response.EnsureSuccessStatusCode();

            // Read and parse the response
            var responseString = await response.Content.ReadAsStringAsync();
            var invitation = JObject.Parse(responseString);

            // Log the invitation data
            Console.WriteLine("Invitation created successfully: " + invitation.ToString());

            return invitation;
            }
            catch (Exception ex)
            {
                // Log any errors
                Console.Error.WriteLine(ex);
                return new JObject();
            }
        }

        public async Task<JObject> ReceiveInvitation(string invitation)
        {
            try
            {
                // Step 1: Receive the invitation
                using var content = new StringContent(invitation, Encoding.UTF8, "application/json");
                var response = await _http.PostAsync("/out-of-band/receive-invitation", content);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var invitationResponse = JObject.Parse(responseString);

                Console.WriteLine("Invitation received successfully.");
                
                return invitationResponse; // Return only the response from receive-invitation
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error in ReceiveInvitation: {ex.Message}");
                return new JObject(); // Return empty object on failure
            }
        }

        public async Task<JArray> GetSchemas()
        {
            try
            {
                var response = await _http.GetAsync("/schemas/created");
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var jsonResponse = JObject.Parse(responseString);
                return jsonResponse.Value<JArray>("schema_ids");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JArray();
            }
        }

        public async Task<JObject> GetSchema(string schemaId)
        {
            try
            {
                var response = await _http.GetAsync($"/schemas/{schemaId}");
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                return JObject.Parse(responseString);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JObject();
            }
        }

        public async Task<JArray> GetCredentialDefinitions()
        {
            try
            {
                var response = await _http.GetAsync("/credential-definitions/created");
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var jsonResponse = JObject.Parse(responseString);
                return jsonResponse.Value<JArray>("credential_definition_ids");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JArray();
            }
        }

        public async Task<JObject> GetCredentialDefinition(string credentialDefinitionId)
        {
            try
            {
                var response = await _http.GetAsync($"/credential-definitions/{credentialDefinitionId}");
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var jsonResponse = JObject.Parse(responseString);
                return jsonResponse.Value<JObject>("credential_definition");
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JObject();
            }
        }

        public async Task<JObject> SendCredential(string credential)
        {
            try
            {
                    // Print the content before sending the request
                      Console.WriteLine("Sending Credential Request:");
                     Console.WriteLine(credential);

                using var content = new StringContent(credential, Encoding.UTF8, "application/json");
                 // Print the content before sending the request
                      Console.WriteLine("Sending Content Request:");
                     Console.WriteLine(content);
                var response = await _http.PostAsync("/issue-credential-2.0/send-offer", content);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                return JObject.Parse(responseString);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return new JObject();
            }
        }

    }
}
