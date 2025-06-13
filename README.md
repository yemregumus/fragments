Introductory AWS Cloud Project

Description
This microservice project is engineered to efficiently store, retrieve, and manage diverse data fragments through APIs, facilitating seamless integration with IoT devices in industrial environments. The service utilizes AWS Cognito for robust authentication, ensuring secure interactions between authorized devices and users. The CI/CD pipeline is meticulously designed to automate comprehensive testing and ensure seamless, reliable deployment.

The Continuous Integration (CI) workflow is initiated upon commits being pushed to GitHub. The CI pipeline encompasses a series of rigorous jobs, including executing all unit and integration tests, and performing lint checks across the codebase to enforce stringent coding standards. Following the successful completion of these checks, the Docker container is built and subsequently pushed to DockerHub, ensuring that only validated code is deployed.

The Continuous Deployment (CD) workflow is activated when a new version tag is pushed to GitHub. This workflow involves building the latest code and pushing the resulting image to Amazon ECR. Utilizing GitHub secrets, AWS credentials are securely configured to log into Amazon ECR. The workflow updates the ECS task definition with the newly built image ID, and the updated task definition is deployed to Amazon ECS. This process guarantees that the service operates with the latest version, configured with the appropriate environment variables for production deployment.

System Architecture
![image](https://github.com/user-attachments/assets/d37b0ee3-e281-4d18-9429-b01daf7b968a)
![image](https://github.com/user-attachments/assets/2164cbfb-df85-4415-8420-89b5bca4715f)


System Architecture

List of APIs

Note: All the requests should have the authorization token in the Header.


GET

/v1/fragments: Get an array of fragments stored by the user.

/v1/fragments/:id: Get the fragment stored using its id.

/v1/fragments/:id.ext: Get the fragment stored using its id converted in the required and supported type.

/v1/fragments/:id/info: Get the metadata of the fragmented using its id.

POST

/v1/fragments: Store a new fragment.

Requirements: The header should have a Content Type property, the value of which would be the type of the fragment the user intends to store.

Returns: Once the fragment is stored successfully, this request returns a location property in the response. This property includes a URL which can be used to access the stored fragment.

PUT

/v1/fragments/:id: Update an existing fragment.

Note: Type of the fragment cannot be updated once its created.

DELETE

/v1/fragments/:id: Update an existing fragment.

How to run the project

Clone this repository and install all the dependencies using npm install.

Start the server in dev mode

npm run dev

Start the server in prod mode

npm start
