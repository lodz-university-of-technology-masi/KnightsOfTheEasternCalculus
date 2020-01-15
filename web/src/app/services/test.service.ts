import { Injectable } from '@angular/core';
import { Test } from '../model/test';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import * as Globals from '../app-consts';
import { OpenQuestion } from '../model/open-question';
import { CloseQuestion } from '../model/close-question';
import { TestInstance, TestStatus } from '../model/test-instance';
import { Observable, of } from 'rxjs';
import { SolvableOpenQuestion } from '../model/solvable-open-question';
import { SolvableCloseQuestion } from '../model/solvable-close-question';
import { map } from 'rxjs/operators';
import axios from "axios";
import { saveAs } from 'file-saver';
import { CustomHttpParamEncoder } from './encoder';
import { ValueQuestion } from '../model/value-question';
import { SolvableValueQuestion } from '../model/solvable-value-question';
import {AuthenticationRecruiterService} from './authentication-recruiter.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class TestService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthenticationRecruiterService
  ) {
  }

  private testUrl: string = Globals.apiBaseUrl + '/recruiters';
  private importedTest: Test;

  public createTest(inputTestTitle, language, openQuestions, closeQuestions, valueQuestions) {
    var test = new Test(this.authService.getUserId(), null, inputTestTitle, language, openQuestions, closeQuestions, valueQuestions);
    return this.httpClient.post<Test>(`${this.testUrl}/${this.authService.getUserId()}/tests`, test, httpOptions);
  }

  public updateTest(testId, inputTestTitle, language, openQuestions, closeQuestions, valueQuestions) {
    var test = new Test(this.authService.getUserId(), testId, inputTestTitle, language, openQuestions, closeQuestions, valueQuestions);
    return this.httpClient.put(`${this.testUrl}/${this.authService.getUserId()}/tests/${testId}`, test, httpOptions);
  }

  public async translateTest(test: Test, language: string) {
    //  https://translate.yandex.net/api/v1.5/tr.json/translate
    //  ? key=<API key>
    //  & text=<text to translate>
    //  & lang=<translation direction>
    var yandexKey = 'trnsl.1.1.20200108T191910Z.fe657624420b3a8c.9b1c3b15e8688d96a425d4596dfc2c6321f04ee2';
    var translateUrl = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=';
    var lang = ''
    var result = new Test('', null, '', '', [], [], []);
    if (language == 'pl') {
      lang = '&lang=en-pl';
    } else {
      lang = '&lang=pl-en';
    }

    result.title = (await axios.post(translateUrl + yandexKey + '&text=' + test.title + lang)).data.text[0];
    result.language = language;

    for (let i = 0; i < test.closeQuestions.length; i++) {
      // question: string, correctAnswers: string[], incorrectAnswers: string[], answerScore: number
      var closeQuestion = new CloseQuestion('', [], [], 0);
      closeQuestion.question = (await axios.post(translateUrl + yandexKey + '&text=' + test.closeQuestions[i].question + lang)).data.text[0];
      closeQuestion.answerScore = test.closeQuestions[i].answerScore;

      for (let j = 0; j < test.closeQuestions[i].correctAnswers.length; j++) {
        closeQuestion.correctAnswers.push((await axios.post(translateUrl + yandexKey + '&text=' + test.closeQuestions[i].correctAnswers[j] + lang)).data.text[0])
      }

      for (let j = 0; j < test.closeQuestions[i].incorrectAnswers.length; j++) {
        closeQuestion.incorrectAnswers.push((await axios.post(translateUrl + yandexKey + '&text=' + test.closeQuestions[i].incorrectAnswers[j] + lang)).data.text[0])
      }

      console.log(closeQuestion);
      result.closeQuestions.push(closeQuestion);
    }

    for (let i = 0; i < test.openQuestions.length; i++) {
      // question: string, correctAnswer: string, maxScore: number
      result.openQuestions.push(new OpenQuestion(
        (await axios.post(translateUrl + yandexKey + '&text=' + test.openQuestions[i].question + lang)).data.text[0],
        (await axios.post(translateUrl + yandexKey + '&text=' + test.openQuestions[i].correctAnswer + lang)).data.text[0],
        test.openQuestions[i].maxScore));
    }

    for (let i = 0; i < test.valueQuestions.length; i++) {
      // question: string, correctAnswer: number, maxScore: number
      result.valueQuestions.push(new ValueQuestion(
        (await axios.post(translateUrl + yandexKey + '&text=' + test.valueQuestions[i].question + lang)).data.text[0],
        test.valueQuestions[i].correctAnswer,
        test.valueQuestions[i].maxScore));
    }

    console.log(result.openQuestions);
    return this.httpClient.post<Test>(`${this.testUrl}/${this.authService.getUserId()}/tests/`, result, httpOptions);
  }

  public downloadTest(test: Test): void {
    let csv: string = '';
    let i: number = 1;

    test.openQuestions = test.openQuestions || [];
    test.closeQuestions = test.closeQuestions || [];
    test.valueQuestions = test.valueQuestions || [];

    test.openQuestions.forEach(function(value) {
      csv += i + ';'
        + 'O' + ';'
        + test.language + ';'
        + value.question.replace(';', '') + ';'
        + '|' + ';'
        + '\n';
      i++;
    });

    test.closeQuestions.forEach(function(value) {
      csv += i + ';'
        + 'W' + ';'
        + test.language + ';'
        + value.question + ';'
        + (value.correctAnswers.length + value.incorrectAnswers.length) + ';';
      value.correctAnswers.forEach(function(txt) {
        csv += txt.replace(';', String.fromCharCode(30)) + ';';
      })
      value.incorrectAnswers.forEach(function(txt) {
        csv += txt.replace(';', String.fromCharCode(30)) + ';';
      })
      csv += '\n';
      i++;
    });

    test.valueQuestions.forEach(function(value) {
      csv += i + ';'
        + 'L' + ';'
        + test.language + ';'
        + value.question + ';'
        + '|' + ';'
        + '\n';
      i++;
    })

    console.log('plik csv' + csv);

    let file = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    saveAs(file, test.title + '-' + test.testId + '.csv');
  }

  public importTest(file: string) {
    var splitFile = file.split('\n');

    let language: string, openQuestions: OpenQuestion[] = [], closeQuestions: CloseQuestion[] = [], valueQuestions: ValueQuestion[] = [];

    splitFile.forEach(function(value) {
      var splitValue = value.split(';');
      if (splitValue[1] == 'O') {
        if (splitValue.length > 6) {
          throw new Error("Invalid number of field.");
        }
        openQuestions.push(new OpenQuestion(splitValue[3].replace(String.fromCharCode(30), ';'), '', 1));
      } else if (splitValue[1] == 'W') {
        if (splitValue.length != parseInt(splitValue[4])) {
          let answers: string[] = [];
          for (let i = 5; i < splitValue.length - 1; i++) {
            answers.push(splitValue[i].replace(String.fromCharCode(30), ';'));
          }
          closeQuestions.push(new CloseQuestion(splitValue[3], [], answers, 1));
        }
      } else if (splitValue[1] == 'L') {
        valueQuestions.push(new ValueQuestion(splitValue[3].replace(String.fromCharCode(30), ';'), 0, 1))
      }
    });
    language = splitFile[0].split(';')[2];

    var test = new Test('', null, '', language, openQuestions, closeQuestions, valueQuestions);
    this.importedTest = test;
    return test;
  }

  public getImportedTest() {
    return this.importedTest;
  }

  public getTest(testID: number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.httpClient.get(`${this.testUrl}/${this.authService.getUserId()}/tests/${testID}`, httpOptions);
  }

  public getAllTests(title: string = ''): Observable<Test[]> {
    const params = new HttpParams({encoder: new CustomHttpParamEncoder()}).set('title', title);
    return this.httpClient.get<Test[]>(`${this.testUrl}/${this.authService.getUserId()}/tests/`, {params});
  }

  public getTestInstances(id: string) {
    return this.httpClient.get(Globals.apiBaseUrl + '/applicants/' + id + '/tests');
  }

  public getTestInstance(id: string, timestamp: string) {
    return this.httpClient.get(Globals.apiBaseUrl + '/applicants/' + id + '/tests/' + timestamp);
  }

  public deleteTest(testId: number) {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.httpClient.delete(`${this.testUrl}/${this.authService.getUserId()}/tests/${testId}`, httpOptions);
  }

  public deleteTestInstance(applicantId: string, timestamp: string) {
    return this.httpClient.delete(`${Globals.apiBaseUrl}/applicants/${applicantId}/tests/${timestamp}`, {observe: 'response'});
  }

  public sendSolvedTest(test: TestInstance) {
    console.log(test);
    return new Observable(observer => {
      this.httpClient.patch<TestInstance>(Globals.apiBaseUrl + '/applicants/' + test.applicantId + '/tests', test, httpOptions)
        .subscribe({
          error: err => {
            console.log(err);
            observer.error(err);
          },
          next: value => {
            observer.next(1);
            observer.complete();
          }
        });
    });
  }


  public sendGradedTest(test: TestInstance) {
    return new Observable(observer => {
      this.httpClient.put<TestInstance>(Globals.apiBaseUrl + '/applicants/' + test.applicantId + '/tests', test, httpOptions)
        .subscribe({
          error: err => {
            console.log(err);
            observer.error(err);
          },
          next: value => {
            observer.next(1);
            observer.complete();
          }
        });
    });
  }

  assignApplicantToTest(_testId: number, applicantId: string, confirm: boolean) {
    return this.httpClient.post<string>(`${Globals.apiBaseUrl}/applicants/${applicantId}/tests`,
      {recruiterId: this.authService.getUserId(), testId: _testId, force: confirm}, {observe: 'response'});
  }
}
