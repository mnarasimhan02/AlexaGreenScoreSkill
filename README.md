[Greenscore]
<a href='https://www.amazon.com/Mahesh-N-Green-Score/dp/B073QZDWQR/ref=sr_1_1?s=digital-skills&ie=UTF8&qid=1510126348&sr=1-1&keywords=green+score'></a>

# Sample AWS Lambda function for Alexa
A  [AWS Lambda](http://aws.amazon.com/lambda) function that provides greenscore information of various cities in USA and provides random facts for improving sustainability for walking , biking and car dependant cities. The skill uses Alexa nodeSDK

## Concepts

- Web service: communicate with an external web service to get walk and bike scores data from the [Walk Score-API](https://www.walkscore.com/professional/api.php)
- Multiple optional slots: has 2 Intent (CityNameIntent and NextCityIntent), where the user can provide city names in US[uses default type: AMAZON.US_CITY]
- Custom slot type: demonstrates using custom slot types to handle a finite set of known US city values
- Dialog and Session state: Handles two models, both a one-shot ask and tell model, and a multi-turn dialog model using NextCityIntent.
- SSML: Uses the SSML tag to include proper pause and breaks in the welcome response and facts responses

## Setup
To run this example skill you need to do two things. The first is to deploy the example code in lambda, and the second is to configure the Alexa skill to use Lambda.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Skip the blueprint
4. Name the Lambda Function "Greenscore--Skill".
5. Select the runtime as Node.js
6. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
7. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda
8. Keep the Handler as index.handler (this refers to the main js file in the zip).
9. Create a basic execution role and click create.
10. Leave the Advanced settings as the defaults.
11. Click "Next" and review the settings then click "Create Function"
12. Click the "Event Sources" tab and select "Add event source"
13. Set the Event Source type as Alexa Skills kit and Enable it now. Click Submit.
14. Copy the ARN from the top right to be used later in the Alexa Skill Setup.

### Alexa Skill Setup
1. Go to the [Alexa Console](https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set "Green Score" for the skill name and "Green Score" as the invocation name, this is what is used to activate your skill. For example you would say: "Alexa, Ask Green Score when is high tide in Seattle."
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json.
6. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
5. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID,
   then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
8. You are now able to start testing your sample skill! You should be able to go to the [Echo webpage](http://echo.amazon.com/#skills) and see your skill enabled.
9. In order to test it, try to say some of the Sample Utterances from the Examples section below.
10. Your skill is now saved and once you are finished testing you can continue to publish your skill.

## Examples
Example user interactions:

### One-shot model:
    User:  "Alexa, ask Green Score get me greenscore for seattle"
    Alexa: "Welcome to Green Score. Using Green Score you can get walk and bike scores of cities in the United States ..."
    User:  "baltimore"
    Alexa: "Walkscore for Baltimore is 99 and the area is Walker's Paradise ..."

### Dialog model:
    User:  "Alexa, open Green Score"
    Alexa: "Welcome to Green Score. Using Green Score you can get walk and bike scores of cities in the United States"
    User:  "what is the score for seattle"
    Alexa: "Walkscore for Baltimore is 99 and the area is Walker's Paradise ..."
    User:  "Yes seattle"
    Alexa: "Walkscore for Seattle is 99 and the area is Walker's Paradise ..."
