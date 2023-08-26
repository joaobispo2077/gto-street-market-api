#! /bin/bash

## ** Examples (npm run auth <stage> <region> <command>)
## ** run the commands below from root level in your terminal
## **** Signup: npm run auth dev us-west-2 signup
## **** Signin: npm run auth dev us-west-2 signin

stage=$1
region=$2
action=$3
stack_name="street-market-cognito-dev"
# swap in your email below
email="example@company.com"
pw="0f027d4b-6c42-468E!"

# swap in your own password (8+ characters w/ symbol, uppercase, lowercase, and number)
# we are using pwgen utility to generate a random password
# install it on your *nix machine with: 
# brew install pwgen
# sudo apt-get install -y pwgen

# pw=$(pwgen -s 10 -1 -y)
# echo "Your password is: $pw"

# default stage if nothing passed
if [[ -z $stage ]];
then
    echo "no stage passed"
    exit 1
fi

# default region if nothing passed
if [[ -z $region ]];
then
    echo "no region passed"
    exit 1
fi

if [[ -z $action ]];
then
    echo "no action passed, default to signup, needs to be signup, confirmsignin, or signin"
    exit 1
fi
    
# use AWS CLI to pull in cloudformation outputs (uses default ~/.aws/credentials profile)
cognito_client_id=$(aws cloudformation --region $region describe-stacks --stack-name $stack_name --query "Stacks[0].Outputs[?OutputKey=='UserPoolClientId'].OutputValue" --output text)
user_pool_id=$(aws cloudformation --region $region describe-stacks --stack-name $stack_name --query "Stacks[0].Outputs[?OutputKey=='UserPoolId'].OutputValue" --output text)
            
# based on action passed handle related cognito action
if [[ $action == "signup" ]]
then
    aws cognito-idp sign-up --region $region --client-id $cognito_client_id --username $email --password $pw && aws cognito-idp admin-confirm-sign-up --region $region --user-pool-id $user_pool_id --username $email
    echo "$email signed up"
elif [[ $action == "signin" ]]
then
    signin_result=$(aws cognito-idp initiate-auth --region $region --auth-flow USER_PASSWORD_AUTH --output json --client-id $cognito_client_id --auth-parameters USERNAME=$email,PASSWORD=$pw)
    if [[ $signin_result ]];
    then
        echo "$email signed in"
        jwt_token=$signin_result
        echo "JWT Token:"
        echo $jwt_token
    else
        echo "problem with signin"
        exit 1
    fi
fi
    