# CDK workshop with Typescript (against LocalStack)

## Requirements

**Notice:** You do not need to create any LocalStack or AWS accounts!

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
