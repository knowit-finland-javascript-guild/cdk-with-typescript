# CDK workshop with Typescript (against LocalStack)

## Requirements

> NOTE: You do not need to create any accounts for LocalStack or AWS
> no matter what they say on the website!

0. Some terminal (shell/bash/zsh/etc.). `Git Bash` is recommended for Windows.
1. Docker installation
2. npm
3. AWS CDK CLI for LocalStack: https://docs.localstack.cloud/aws/integrations/aws-native-tools/aws-cdk/
    * `npm install -g aws-cdk-local aws-cdk`
    * `cdklocal --version`
4. AWS CLI https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
    * `aws --version`

## Getting started

It is advisable to use the "default" AWS CLI profile, make sure it's not connected to a real AWS account!

Let's configure the default profile for AWS CLI:

```bash
aws configure
AWS Access Key ID [None]: id
AWS Secret Access Key [None]: access-key
Default region name [eu-north-1]:
Default output format [json]:
```

Access Key Id and Secret Access Key do not matter when working with LocalStack.
The values for these can be whatever. We can set `eu-north-1` as the default region
and choose `json` as the default output format.

Start the LocalStack from the root folder in a container:

```bash
docker compose up
```

Check that it is running:

```bash
curl http://localhost:4566/_localstack/health
```

## Exercise 0: Create the initial CDK Sample App

Create an empty `app` directory, navigate to it, and run the following command

```bash
cdklocal init sample-app --language=typescript
```

### Typescript must be compiled to JavaScript

Immediately open a new terminal window and run

```bash
npm run watch
```

Now whenever you change a `.ts` file, it will be automatically compiled into a `.js` file in the background!

Although this compilation is performed automatically whenever you run CDK commands,  
if you don't remember to compile your code you may run into issues when editing the CDK code and running tests. 

Leave this terminal running until the end of the workshop.

### GitOps

Also notice that the `cdklocal init` command also turned the `app` directory into a git repository.

In general, when working with Infrastructure-as-Code (IaC), 
it is a good idea to track changes with git (e.g. commit after successful deploy)

For this workshop, we recommend you create a new commit after each exercise, 
but it's also OK to play with danger, if that's more your style!

## Exercise 0.5: Exploring the Sample App

Looking at the code in `lib/app-stack.ts`, the sample app seems to only create three AWS resources:

1. An SNS Topic (SNS = Simple Notification Service)
2. An SQS Queue (SQS = Simple Queue Service)
3. The SQS Queue then becomes a Subscriber to the Topic

So that's Topic + Queue + Subscription = 3 resources, right?

Almost! Additionally the Topic gets the necessary write access to the Queue. We don't see it here,
because CDK creates the necessary resources for us behind the scenes!

Let's see what the actual CloudFormation template looks like to see everything that
CDK has created for us.

```bash
cdklocal synth
```

This will output a lovely CloudFormation YAML to your tiny terminal.

> **NOTE:** If you hate YAML and love JSON, you can use the `--json` flag.

After you've synthesized the template,
you can always find the JSON version of it in `/cdk.out/AppStack.template.json`.

Let's look at the `Resources` section in the CDK Template, focusing on the `Type` of each resource.

We can identify four resources in total:

1. `AWS::SQS::Queue`
2. `AWS::SQS::QueuePolicy` (Adds permissions for the Topic to write to the SQS Queue)
3. `AWS::SNS::Subscription`
4. `AWS::SNS::Topic`

We don't need to bother ourselves with the `CDKMetadata` and `Parameters` sections of the template right now,
and we don't yet have anything in the `Outputs` section, but it's good to be aware that they also exist in
the CloudFormation template.

Ultimately, this template is the recipe that we hand off to AWS so it knows which resources it needs to create.


## Exercise 1: Bootstrap the CDK environment

Quoting AWS:

> [Bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) prepares your AWS environment by
> provisioning specific AWS resources in your environment that are used by the AWS CDK.  
> These resources are commonly referred to as your bootstrap resources. They include the following:
>
> - Amazon Simple Storage Service (Amazon S3) bucket – Used to store your CDK project files, such as AWS Lambda function
    code and assets.
> - Amazon Elastic Container Registry (Amazon ECR) repository – Used primarily to store Docker images.
> - AWS Identity and Access Management (IAM) roles – Configured to grant permissions needed by the AWS CDK to perform
    deployments.

Before bootstrapping, we should define our accountId and region for the stack in our sample app.

Replace the contents of `bin/app.ts` with the following:

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';

const app = new cdk.App();
new AppStack(app, 'AppStack', {
  env: {
    account: '000000000000', // Default LocalStack accountId
    region: 'eu-north-1',    // Stockholm rules !!
  }
});
```

In app dir, run:

```bash
# AWS accountId and region are prefilled from the parameters of `AppStack`
cdklocal bootstrap 
```

> **SIDENOTE**
>
> This command receives AWS account id and region from the parameters of `AppStack`  
> The command could be done from any directory by specifying the parameters explicitly:  
> `cdklocal bootstrap 000000000000/eu-north-1`

Don't forget to `git add . && git commit` after each exercise!

## Exercise 2: First Deploy

Deploy the sample app:

```bash
cdklocal deploy
```

You will be asked to confirm ("y") that the SNS Topic gets rights to write to the SQS Queue.

Once the deployment is done,
we can inspect the created resources using AWS CLI.

Because of LocalStack, we have to append a lengthy `--endpoint-url` flag to our command

```bash
# Check that an SNS Topic was created
aws --endpoint-url=http://localhost:4566 --region=eu-north-1 sns list-topics
```

Because this is long and annoying, let's create a some npm scripts to help us with the AWS CLI commands.
(Plus a few extras that we will need later!)

Replace the "scripts" section in `package.json` with these:

```
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest",
    "build-test": "tsc && jest",
    "cdk": "cdk",
    "cdklocal-redeploy": "cdklocal destroy --force && cdklocal deploy --require-approval never",
    "aws-sns-list-topics": "aws --endpoint-url=http://localhost:4566 --region=eu-north-1 sns list-topics",
    "aws-sqs-list-queues": "aws --endpoint-url=http://localhost:4566 --region=eu-north-1 sqs list-queues",
    "aws-lambda-list-functions": "aws --endpoint-url=http://localhost:4566 --region=eu-north-1 lambda list-functions",
    "aws-apigateway-get-rest-apis": "aws --endpoint-url=http://localhost:4566 --region=eu-north-1 apigateway get-rest-apis",
    "aws-dynamodb-scan-table-items": "aws --endpoint-url=http://localhost:4566 --region=eu-north-1 dynamodb scan --table-name items"
  }
```

Now we can simply run this command to get the same result:

```bash
npm run aws-sns-list-topics
```

## Wait, what just happened?

This is all great, but what exactly did we actually create?

- [Amazon SNS](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) is used for Publisher-Subscriber patterns. 
- [Amazon SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) a message queue with some fancy features, services poll messages from it. 
- Our Topic receives messages and pushes them to all it's subscribers, including our SQS Queue, from which preserves
the message for us until we read it (asynchronous processing). 
- If you want to know more, 
  [see the AWS documentation about this SNS fanout pattern](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html).

Right, now let's get on with it!

## Exercise 2.6:

First, Get and Copy the Topic ARN:
```bash
npm run aws-sns-list-topics
```

Then Send a message to the topic. Replace <TOPIC_ARN> with the one you just copied.
```bash
# Execute as a single command
aws --endpoint-url=http://localhost:4566 --region=eu-north-1 \
    sns publish --topic-arn='<TOPIC_ARN>' --message 'HELLO WORLD'
```

Next, list your sqs queues, Copy the QueueUrl:

```bash
npm run aws-sqs-list-queues
```

Then read the message from the Queue.

```bash
# Execute as a single command
aws --endpoint-url=http://localhost:4566 --region=eu-north-1 \
    sqs receive-message --queue-url='<QUEUE_URL>'
```

You should see a json formatted message. Somewhere in the body you can read `Message: "HELLO WORLD"`.

Well done! 

Don't forget to `git add . && git commit` after each exercise. We'll stop reminding from now this point on.

## Exercise 3: Run tests

CDK init has created a sample test for us in `/tests/app.test.ts`

The test executes our CDK code, and then synthesises a CloudFormation template (AWS-native IaC) of the Stack.

The assertions are done against this template which actually defines what resources deployed to AWS.

The sample test checks that there is a `AWS::SQS::Queue` resource with a
[VisibilityTimeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html)
property set to `300` seconds.

It also checks that exactly one `AWS::SNS::Topic` resource has been made.

Run tests with
```bash
npm test
```

## Exercise 4: Modify AppStack

Let's modify the resources of `lib/app-stack.ts` a bit.

1. Change the `visibilityTimeout` of `AppQueue` parameter to `100` seconds
2. Create a second SQS Queue
  - Set id = `AppQueue2`
    - Note that CDK wants a unique id for each resource.
  - Set the `visibilityTimeout` parameter to `30` seconds
3. Add `AppQueue2` as the second subscriber to `AppTopic`
4. Run the tests and confirm that they fail.
5. Fix the tests by adding the following:
    - Check that there are two `AWS::SQS::Queue` resources
        - Check that there is at least Queue with property `VisibilityTimeout: 100`
        - Check that there is at least Queue with property `VisibilityTimeout: 30`
    - Add a new check that there are `2` resources of type `AWS::SNS::Subscription`
6. Run the tests and confirm that they pass

Well done!

## Exercise 5: Update AppStack

Well, we cannot really "update" AppStack...

If we would be working against a real AWS environment,
we could simply check the diff and deploy the sample AppStack again,
and everything should work fine.

Unfortunately for us, LocalStack really sucks at updating existing stacks.

For the sake of the exercise let's still check the diff with:
```bash
cdklocal diff
```

You can see what new resources would be created with the new deployment.

With LocalStack, the only way forward is to destroy and redeploy our Stack,
or the entire App, as we are about to do here!

Idempotent deploys for the win, eh?

For this we have the npm script `cdklocal-redeploy`,
which executes the following two commands:

```bash
# `npm run cdklocal-redeploy` excutes these:
cdklocal destroy --force && cdklocal deploy --require-approval never
```

The `--force` and `--require-approval never` liberate use from the arduous task of manual confirmation.

We can now run the script:

```bash
npm run cdklocal-redeploy
```

Check that now we have two SQS queues

```bash
npm run aws-sqs-list-queues
```

Well done!

## Excercise 6: Deploy a Hello World service with Lambda function and Api Gateway

[AWS Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) are great, let's deploy one!

Add the following lines of code inside the AppStack constructor in `lib/app-stack.ts`.

It can be, for example underneath the existing Topic and Queue resource code.

```typescript
// previous imports ...

// add these imports!
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';


export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ... AppQueues and AppTopic resources ...

    const fn = new NodejsFunction(this, 'Function', {
      entry: join(__dirname, 'lambda-handler', 'hello.ts'),
      runtime: Runtime.NODEJS_22_X
    });

    const endpoint = new LambdaRestApi(this, `ApiGwEndpoint`, {
      handler: fn,
      restApiName: `HelloApi`,
    });
  }
}
```

This creates a

- **Lambda function** with Node runtime which is
- integrated to an **Api Gateway Endpoint**, so we can trigger the Lambda ourselves.

Now we just need to write the Lambda handler code.

We can use Typescript: CDK supports transpiling Typescript into Javascript out-of-the-box with the 
possibility of customising esbuild behaviour (more info about that 
[here](https://docs.aws.amazon.com/lambda/latest/dg/typescript-package.html)).

Install the required TypeScript types with

```bash
npm install -D @types/aws-lambda
```

Create a new folder `/lib/lambda-handler` and create a new file named `hello.ts` there with the following content:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// A domain specific type
type Person = {
    firstName: string;
    lastName: string;
    age: number;
}

// An union type to describe possible values
type LambdaMethod = "startsWithA" | "fullName";

// A type to describe the expected shape of the request body
type RequestBody = {
    method: LambdaMethod;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const genericError = "Something went wrong, try again later";

    // Type cannot be used as a value
    // Create a separate array consisting of values of the type
    const lambdaMethods: LambdaMethod[] = ["startsWithA", "fullName"];

    const people: Person[] = [
        {
            firstName: "Anni",
            lastName: "Esimerkki",
            age: 65,
        },
        {
            firstName: "John",
            lastName: "Doe",
            age: 42,
        },
        {
            firstName: "An",
            lastName: "Example",
            age: 627,
        },
    ];

    // Property destructuring
    const { body } = event;

    // Get the request body as an object
    const requestBody = typeof body == 'object' ? body : JSON.parse(body);

    // If body is missing, throw an error
    if (!requestBody) throw new Error(genericError);

    // If body does not match out spec, throw an error
    if (!requestBody.method || !lambdaMethods.includes(requestBody.method)) throw new Error(genericError);

    // Since we have validated the input, we can cast it to a real type
    const validatedBody = requestBody as RequestBody

    // Filter people whose first name starts with a
    const nameStartsWithA = people.filter((person) => person.firstName.toLowerCase().startsWith("a"));

    // Create a full name for each person
    const fullNames = people.map((person) => `${person.firstName} ${person.lastName}`);

    const response = validatedBody.method === "startsWithA" ? nameStartsWithA : fullNames

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
};

```

Let's Redeploy

```bash
# This will take some time, as docker image for the Lambda will be built
npm run cdklocal-redeploy
```

CDK gives an API GW endpoint URL as an Output.
This endpoint calls the lambda function and returns its result.

```bash
# Example output
Outputs:
AppStack.ApiGwEndpoint77F417B1 = https://r72pyu2yff.execute-api.localhost.localstack.cloud:4566/prod/
```

Copy this endpoint URL somewhere so we can send requests to it later.

Next, verify that the Lambda and the ApiGateway RestApi were created.

```bash
npm run aws-lambda-list-functions
npm run aws-apigateway-get-rest-apis 
```

Send a HTTP POST request to the endpoint and check the response:

```bash
curl --header "Content-Type: application/json" --request POST \
--data '{"method":"fullName"}' https://r72pyu2yff.execute-api.localhost.localstack.cloud:4566/prod/
```

Check the valid values for the `method` from the code and experiment.

Well done!

We will write some tests for this Lambda soon, but first, it's time to refactor our code a bit.

## How do we organize a CDK app?

AWS best practise guidance for organisation is that

- `/bin` holds CDK App (in this case app.ts), the entrypoint for everything
  - The purpose of the **App** is to compose Stacks (or Stages)
- `/lib` holds everything else
  - **Stacks**: The smallest deployable unit, represents a CloudFormation template.
  - **Constructs**: Can be a single Resource or a bundle of many Resources
  - **Stages**: Composes Stacks. Their purpose is to separate different deployment environments (Dev, Test, Prod, etc.)
    - However, we've noticed that in the industry people don't use Stages,
      but instead rely on flags and configuration files to create differences between Dev, Test, Prod etc.

Beyond this, it's anybody's game. AWS has some [instructions for large-scale projects](
https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/organizing-code-best-practices.html
), but that's really not helpful here.

Our advice is to organise it in the way that makes most sense to you and your team.

For the purposes of this demo workshop, though, let's organise our code around the core concepts of CDK.

**Create the following directories:**

```bash
mkdir lib/constructs ;
mkdir lib/stacks ;
mkdir lib/stages ;
```

Now onwards!

## Model with Constructs, deploy with Stacks

We will teach you the AWS best practices, because they seem reasonable:

> #### Model with constructs, deploy with stacks
> For example, if one of your logical units is a website, the constructs that make it up (such as an Amazon S3 bucket,
> API Gateway, Lambda functions, or Amazon RDS tables) should be composed into a single high-level Construct.
> Then that Construct should be instantiated in one or more Stacks for deployment.

But be warned! 

In the wild, it is more common that the example scenario would have an S3BucketStack, APIGWStack,
LambdaStack(s) and RDSTableStacks. We've even seen Stacks for individual read-write permissions. 
Although this is not according to AWS best practises, there are often be good reasons for doing this.

Here we will stick to the best practices approach.

## Exercise 6.5: Destroy the current deployment

We are about to start nesting Constructs and moving Constructs from one Stack to another.
These refactorings will modify the Logical IDs  of our deployed resources. After changing them we cannot use CDK
to destroy them anymore.

So it is always wise to destroy our resources now, before doing something that affects the Logical IDs.

```bash
cdklocal destroy --force
```

BTW, changes in Logical IDs are precisely the kind of thing why you would want to always make a `git commit` after a
successful deployment! Cloud people call it `GitOps`, we developers just call it `git`.

> **NOTE:**  
> If your infrastructure gets too stuck, and you can't destroy it with CDK anymore, simply terminate LocalStack  
> by pressing `CTRL+C` in the LocalStack terminal or run `docker-compose down` in the root of the repo.  
> Then you can start LocalStack from fresh, run `cdklocal bootstrap` and finally `cdklocal deploy --require-approval never`.

## Exercise 7: Refactor the Hello Lambda into a Construct!

Let's move the Lambda and ApiGateway code into a HelloService Construct.

Create the file (and required directories) `lib/constructs/hello-service/hello-service.ts` with the following contents:

```typescript
import { Construct } from 'constructs';

export class HelloService extends Construct {
  constructor(scope: Construct, id: string, props: any) {
    super(scope, id);
    // Define your resources here!
    
  }
}
```

Move the code that defines the HelloService and API Gateway Constructs into the constructor.

Move the lambda handler code into `lib/constructs/hello-service/lambda-handler/hello.ts`

Instantiate `HelloService` in `AppStack` with the Logical ID `HelloService`.

`AppStack` should now look like this:

```typescript
// ... previous imports
import { Construct } from 'constructs';
import { HelloService } from './constructs/hello-service/hello-service';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ... SQS Queue and SNS Topic code is still here ...

    new HelloService(this, 'HelloService', {});
  }
}

```

Finally, move the file `app-stack.ts` into `lib/stacks`. Don't forget to fix imports from wherever AppStack is called!

Run tests and see that they pass

```bash
npm test
```

Redeploy and make sure that the Lambda still answers your curl with a perky "Hello world".

Well done!

## Exercise 8: Refactor more!

Once again, we will be touching the Logical IDs, so let's destroy all resources before touching any code.

```bash
cdklocal destroy --force
```

Let's do the same thing for our Queues and Topic. We'll build the QueueService Construct.

We'll repeat what we learned in the previous exercise.

Create the Construct `QueueService` into the file `lib/constructs/queue-service.ts` and move the Queues and the Topic
from AppStack into the constructor of QueueService.

Instantiate `QueueService` in `AppStack` with the Logical ID `QueueService`.

`AppStack` should now look nice and neat:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { HelloService } from './constructs/hello-service/hello-service';
import { QueueService } from './constructs/queue-service';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new QueueService(this, 'QueueService', {});
    new HelloService(this, 'HelloService', {});
  }
}
```

Deploy the App again with

```bash
cdklocal deploy --require-approval never
```


## Exercise 9: Write tests for HelloService

Run `cdklocal synth` or open `/cdk.out/AppStack.template.json` and see what kinds of new Resources were created.

Yikes! That's a lot of Resources.

It creates two HTTP ANY-method endpoints, which proxy the request as a POST to the Lambda function.

- One endpoint for the root path `/`
- Another for `/{proxy+}`, so any path `/foo` and `/foo/bar` will also trigger the Lambda

Both of these endpoints have Resource type `AWS::ApiGateway::Method`.

Let's create some rudimentary tests for `HelloService`!

Create the following test file: `test/hello-service.test.ts`

Copy these contents into it:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { HelloService } from '../lib/constructs/hello-service/hello-service';

test('HelloService Construct Test', () => {
  // WHEN
  
  // Create empty stack with HelloService
  const stack = new cdk.Stack();
  new HelloService(stack, 'TestHelloService', {});

  // THEN
  // CDK Synthesized into a CloudFormation Template
  const template = Template.fromStack(stack);

  // Lambda
  template.resourceCountIs('AWS::Lambda::Function', 1);
  
  // add more tests here!
})
```

Now instead of testing AppStack, we have created an empty Stack that houses our HelloService Construct during the test.
So this is basically a unit test of our Construct.

Add the following assertions:
- The Lambda function has the property `Runtime: "nodejs22.x"`
- One `AWS::ApiGateway::RestApi` exists
- One `AWS::ApiGateway::Deployment` exists
- One `AWS::ApiGateway::Stage` exists
- One `AWS::ApiGateway::Resource` exists
- Two of `AWS::ApiGateway::Method` exist

Run the tests and see that they pass.

Well done!

### Exercise 10: Deploy ItemsApi

At the root of this repository, you will find the `./resources` directory.

Copy the contents of `./resources/items-api` into a new directory `./app/lib/constructs/items-api`

The directory `./app/lib/constructs/items-api` should now look like this:

```bash
./app/lib/constructs/items-api
├── items-api.ts
└── lambda-handler
    ├── create.ts
    └── get-one.ts
```

We will also have to install our dependencies for the two Lambdas, run the following commands in the cdk root `app` directory.

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

The Lambda functions contain unit tests, so we need to slightly modify the `jest.config.js`.
Open up the `app/jest.config.js` and change line 3 `roots: ['<rootDir>/test'],` to `roots: ['<rootDir>'],`.
This changes from which directory our test runner [Jest](https://jestjs.io/) starts to look for files to test.

ItemsApi in `items-api.ts` is a Construct with a Rest API (API GW) that calls a Lambda which saves an item to a DynamoDB.
We also have an endpoint for reading one item with its itemId.

We will assume that ItemsApi is deployable by itself, and does not have dependencies to `AppStack`. So it should be
deployed as its own stack!

Create a new Stack called `ItemsApiStack` into `lib/stacks/items-api-stack.ts` with the following content:

```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ItemsApi } from '../constructs/items-api/items-api';

export class ItemsApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new ItemsApi(this, 'ItemsApi', {})
  }
}
```

Then let's add ItemStack into the CDK App in `bin/app.ts`.

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/stacks/app-stack';
import { ItemsApiStack } from '../lib/stacks/items-api-stack';

const app = new cdk.App();
new AppStack(app, 'AppStack', {
  env: {
      account: '000000000000', // Default LocalStack accountId
      region: 'eu-north-1',    // Stockholm rules !!
    }
});
new ItemsApiStack(app, 'ItemsApiStack', {
  env: {
    account: '000000000000', // Default LocalStack accountId
    region: 'eu-north-1',
  }
});
```

We don't need to tear down `AppStack`, because now we are deploying a totally new stack. However, now we do have to start specifying which Stack we are deploying.

Deploy ItemsApiStack with:

```bash
# This will take some time, as docker images for the Lambdas will be built
cdklocal deploy ItemsApiStack --require-approval never
```

Well done!

## Exercise 11: Test ItemsApi

ItemsApiStack should have outputted the ItemsApi Endpoint URL.
**Remember to append the path "`items`" to the end of it when testing!**

If you don't find it, run `npm run aws-apigateway-get-rest-apis`, get the ApiGateway ID of ItemsApi, and replace the `<ApiGWId>`
in the following test requests.

```bash
# Test requests:

# 201 and returns itemId (UUID) --> note URL ends with /items
curl -v --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"itemName", "description":"itemDesc", "value":51}' https://<ApiGWId>.execute-api.localhost.localstack.cloud:4566/prod/items
  
# copy the returned itemId (UUID) from the final line of the output, (e.g. fc7eeadb-a984-4262-8e59-26933ad98568)
  
# 200 and returns item object as json (it only has itemId, don't worry about that!)
curl -v https://<ApiGWId>.execute-api.localhost.localstack.cloud:4566/prod/items/<itemId>

# "invalid request, you are missing the parameter body" (400)
curl --header "Content-Type: application/json" \
  --request POST  https://<ApiGWId>.execute-api.localhost.localstack.cloud:4566/prod/items
  
# Test dynamoDB has items:
npm run aws-dynamodb-scan-table-items
```

Well done!

## Exercise 12: Dev and Prod Stages

The [CDK Stage](https://docs.aws.amazon.com/cdk/v2/guide/stages.html) represents a group of one or more CDK stacks
that are configured to deploy together. Use stages to deploy the same grouping of stacks to multiple environments,
such as development, testing, and production.

Let's pretend that `AppStack` is only used in Dev -- Prod has no need for it. This would be a good case for 
introducing two separate Stages: `DevStage` and `ProdStage`!

Do the following

1. Destroy currently deployed Stacks with  
   `cdklocal destroy --all --force`
2. Create the class `DevStage` (that extends cdk.Stage) into a new file: `lib/stages/dev-stage.ts`
3. Create the class `ProdStage` (that extends cdk.Stage) into a new file: `lib/stages/prod-stage.ts`
4. In the DevStage constructor,
  - create AppStack with the same logical id `AppStack`
  - create ItemsApiStack with the logical id `ItemsApiStack`
5. In the ProdStage constructor,
- ItemsApiStack with the logical id `ItemsApiStack`


Replace the contents of `bin/app.ts` with the following code:

```typescript
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DevStage } from '../lib/stages/dev-stage';
import { ProdStage } from '../lib/stages/prod-stage';

// Constants
const LOCALSTACK_DEFAULT_ACCOUNTID = '000000000000';
const DEV_REGION = 'eu-north-1';  // Stockholm region
const PROD_REGION = 'eu-west-3';  // Paris region

const app = new cdk.App();

new DevStage(app, 'Dev', {
  env: {
    account: LOCALSTACK_DEFAULT_ACCOUNTID,
    region: DEV_REGION
  }
})

new ProdStage(app, 'Prod', {
  env: {

    // Normally, prod account would be different from dev account
    // However, localStack makes cross-account work difficult for us
    account: LOCALSTACK_DEFAULT_ACCOUNTID,

    region: PROD_REGION  // Instead, let's change the region!
  }
});
```

Bootstrap the account again. Both regions will be bootstrapped separately!

```bash
cdklocal bootstrap
```

Deploy all stacks for both Dev and Prod Stages.

```bash
cdklocal deploy --require-approval=never "Dev/*" "Prod/*"
# "Stage/*" here means just all stacks in stage, so this could also be written as
# cdklocal deploy --require-approval=never "Dev/AppStack" "Dev/ItemsApiStack" "Prod/ItemsApiStack"
```

Verify that both Dev and Prod environments work by CURL:ing each of their ItemsApi POST and GET(-by-id) lambdas.

To access Prod region by AWS CLI use the `--endpoint-url` and `--region` flags

```bash
# For example, to scan Prod dynamodb table "items"
aws --endpoint-url=http://localhost:4566 --region=eu-west-3 dynamodb scan --table-name items
```

You've now completed all the exercises of this workshop! Well done!


## Bonus exercise 1: Write tests for the ItemsApi Construct

This part is optional.

It is easier to write the tests when you have access to the final CloudFormation template of a Stack.

Now with multiple Stages and Stacks, when we want view a template, we have two options:

- Run `cdklocal synth Stage/Stack` to view it for a particular single Stack. 
-  Alternatively, after a successful deploy or `cdklocal synth`, look into the `cdk.out` directory. You should be able to 
  see a directory for each Stage:
    - `cdk.out/assembly-Dev` holds separate template files for `Dev/AppStack` and `Dev/ItemsApiStack`
    - `cdk.out/assembly-Prod` holds the template file `Prod/ItemsApiStack`

Now we have enough information for writing tests for the ItemsApi construct!

Create the file `test/item-api.test.ts`

As a starting point, put the following content into it:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ItemsApi } from '../lib/constructs/items-api/items-api';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

test('ItemsApi Construct Test', () => {
  // WHEN
  const stack = new cdk.Stack();
  new ItemsApi(stack, 'MyTestItemaApi', {});

  // THEN

  // CDK Synthesized into a CloudFormation Template
  const template = Template.fromStack(stack);
  
  template.resourceCountIs('AWS::Lambda::Function', 2);
  

});

```

Write test cases for the following:

- Amount of `AWS::Lambda::Function` resources is 2
- There is a Lambda function resource with property `Runtime: 'nodejs22.x'`
- Amount of `AWS::ApiGateway::RestApi` resources is 1
- Amount of `AWS::ApiGateway::Deployment` resources is 1
- Amount of `AWS::ApiGateway::Resource` resources is 2
    - There exists a `AWS::ApiGateway::Resource` with property `PathPart: 'items'`
    - There exists a `AWS::ApiGateway::Resource` with property `PathPart: '{id}'`
- Amount of `AWS::ApiGateway::Method` resources is 4
    - Also check our that our main methods exist
        - There exists a `AWS::ApiGateway::Method` with property `HttpMethod: 'GET'`
        - There exists a `AWS::ApiGateway::Method` with property `HttpMethod: 'POST'`
- Amount of `AWS::DynamoDB::Table` resources is 1
    - Also write at least one test which validates something about the table schema. It could be, for example: 
        - TableName is `items`
        - attribute 'itemId' is a string type (`AttributeType: 'S'`) )
        - attribute with name 'itemId' is the partitionKey: (`KeySchema: [{ AttributeName: 'itemId', KeyType: 'HASH' }]`)
        - table can be deleted using IaC, check properties `DeletionPolicy` and `UpdateReplacePolicy`

Run tests and see that they pass.

Well done on completing this bonus exercise!


## Bonus exercise 2: Add more endpoints to ItemsApi

This part is optional.

Add whichever endpoints you want to ItemsApi! Some reasonable candidates might be the following:

- Delete by Id
- Get all items

You will find plenty of examples of DynamoDB library calls in AWS Developer Guide, for example in
["Actions"](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/service_code_examples_actions.html).

>**Sidenote:**  
> It can be confusing that we are using both the [DynamoDBDocument library](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/Class/DynamoDBDocument/)
and [DynamoDBClient](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/). 
DynamoDBDocument simply does some mapping so that we can work with regular JS objects instead of the horrible DynamoDB format.

Well done on completing this bonus exercise!

# After the exercises

### (Optional) Destroy resources with CDK

If you did exercise 12 (Stages), destroy all Stacks in all Stages:

```bash
cdklocal destroy "*/*" --force
```

Else, it should be enough to run the following:

```bash
cdklocal destroy --all --force
```

### Stop the npm run watch process

Press `CTRL+C` in the terminal that runs `npm run watch`.

### Terminate LocalStack

Press `CTRL+C` in the terminal running LocalStack.

Alternatively, you can run `docker-compose down` in the root of the repo.

### Clean up global npm installations

`npm uninstall -g aws-cdk-local aws-cdk`

### Removing AWS CLI

If you want to remove AWS CLI, here is a link to the uninstallation guide:  
https://docs.aws.amazon.com/cli/latest/userguide/uninstall.html
