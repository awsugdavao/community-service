import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class StatefulStack extends cdk.Stack {
  public readonly eventsTable: dynamodb.Table;
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props)

    this.eventsTable = this.createEventsTable()
  }

  private createEventsTable() {
    const table = new dynamodb.Table(this, 'EventsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'event_date', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    })

    return table
  }
}
