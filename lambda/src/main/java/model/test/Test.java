package model.test;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAutoGeneratedKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;

import java.io.Serializable;
import java.util.List;

@DynamoDBTable(tableName = "tests")
public class Test implements Serializable {
    private String id;
    private String title;
    private List<CloseQuestion> closeQuestions;
    private List<OpenQuestion> openQuestions;

    public Test() {
    }

    public Test(Test test) {
        if (test.getId() != null) {
            this.id = test.getId();
        }
        this.title = test.title;
        this.closeQuestions = test.closeQuestions;
        this.openQuestions = test.openQuestions;
    }

    @DynamoDBHashKey(attributeName = "id")
    @DynamoDBAutoGeneratedKey
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @DynamoDBAttribute(attributeName = "title")
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @DynamoDBAttribute(attributeName = "closeQuestions")
    public List<CloseQuestion> getCloseQuestions() {
        return closeQuestions;
    }

    public void setCloseQuestions(List<CloseQuestion> closeQuestions) {
        this.closeQuestions = closeQuestions;
    }

    @DynamoDBAttribute(attributeName = "openQuestions")
    public List<OpenQuestion> getOpenQuestions() {
        return openQuestions;
    }

    public void setOpenQuestions(List<OpenQuestion> openQuestions) {
        this.openQuestions = openQuestions;
    }
}