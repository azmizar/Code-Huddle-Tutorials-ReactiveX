/**
 * NodeJS imports
 */
import readline from 'readline';

/**
 * 3rd party import
 */
import { from, Observable, Subscription, Observer } from 'rxjs';
import { mergeMap, map, reduce, switchMap } from 'rxjs/operators';
import request from 'request';

/**
 * IUserInformation interface
 */
interface IUserInformation {
  id: number;
  data: {} | null;
}

/**
 * Application const
 */
const sourceAry: number[] = [1, 3, 4];

/**
 * mergeMap demo
 */
function demoMergeMap(): Observable<IUserInformation[]> {
  return from(sourceAry).pipe(
    map((id: number): IUserInformation => {
      return { id: id, data: null } as IUserInformation;
    }),
    mergeMap((user: IUserInformation): Observable<IUserInformation> => { 
      return Observable.create((obs: Observer<IUserInformation>) => {
        request(`https://jsonplaceholder.typicode.com/users/${ user.id }`, (err, resp, body) => {
          if (err) {
            obs.error(err);
          } else {
            user.data = body;
            obs.next(user);
            obs.complete();
          }
        });
      });
    }),
    reduce((acc: IUserInformation[], data: IUserInformation): IUserInformation[] => {
      acc.push(data);
      return acc;
    }, [])
  );
}

/**
 * Transforms array elements into IUserInformation objects
 */
function demoMap(): Observable<IUserInformation> {
  return from(sourceAry).pipe(
    map((val: number): IUserInformation => { 
      return { id: val, data: null } as IUserInformation;
    })
  );
}

/**
 * switchMap() to change to new Observable getting the external data
 */
function demoSwitchMapRequest(): Observable<IUserInformation> { 
  return demoMap().pipe(
    switchMap((val: IUserInformation): Observable<IUserInformation> => {
      return Observable.create((obs: Observer<IUserInformation>) => {
        request(`https://jsonplaceholder.typicode.com/users/${ val.id }`, (err, resp, body) => {
          if (err) {
            obs.error(err);
          } else {
            val.data = body;
            obs.next(val);
            obs.complete();
          }
        });
      });
    })
  );
}

/**
 * mergeMap() to change to new Observable getting the external data
 */
function demoMergeMapRequest(): Observable<IUserInformation> {
  return demoMap().pipe(
    mergeMap((val: IUserInformation): Observable<IUserInformation> => {
      return Observable.create((obs: Observer<IUserInformation>) => {
        request(`https://jsonplaceholder.typicode.com/users/${ val.id }`, (err, resp, body) => {
          if (err) {
            obs.error(err);
          } else {
            val.data = body;
            obs.next(val);
            obs.complete();
          }
        });
      });
    })
  );
}

/**
 * reduce dempMap() to combine all elements into an array and return as Observable
 */
function demoMapReduce(): Observable<IUserInformation[]> {
  return demoMap().pipe(
    reduce((acc: IUserInformation[], data: IUserInformation): IUserInformation[] => {
      acc.push(data);
      return acc;
    }, [])
  );
}

/**
 * reduce demoSwitchMapRequest() to combine all elements into an array and return as Observable
 */
function demoSwitchMapReduce(): Observable<IUserInformation[]> {
  return demoSwitchMapRequest().pipe(
    reduce((acc: IUserInformation[], data: IUserInformation): IUserInformation[] => {
      acc.push(data);
      return acc;
    }, [])
  );
}

/**
 * reduce demoMergeMapRequest() to combine all elements into an array and return as Observable
 */
function demoMergeMapReduce(): Observable<IUserInformation[]> {
  return demoMergeMapRequest().pipe(
    reduce((acc: IUserInformation[], data: IUserInformation): IUserInformation[] => {
      acc.push(data);
      return acc;
    }, [])
  );
}

/**
 * Driver function to execute demo functions
 */
function executeDemo(name: string, func: Function, cb: Function) {
  let subs: Subscription;

  const prom: Promise<string> = new Promise((resolve, reject) => {
    console.log(`>>>>> ${ name }`);

    subs = func().subscribe((val: IUserInformation) => {
      console.log(JSON.stringify(val));
      resolve(name);
    }, (err: Error) => {
      reject(err.message);
    }, () => {
        console.log(`Observable complete(): ${ name }`);
    });
  });

  prom.then((val) => {
    subs.unsubscribe();
  }).catch((err) => {
    console.log('Error: ' + err);
  }).finally(() => {
    console.log(`<<<<< ${ name }`);
    console.log('');
    cb();
  });
}

/**
 * Simple menu
 */
function displayMenu() {
  console.log(`Choose a demo to execute:\n
    1. demoMap() - transforms array elements
    2. demoMapReduce() - returns result from demoMap() as an array
    3. demoSwitchMapRequest() - switch demoMap() results into Observables that depend on REST API
    4. demoSwitchMapReduce() - returns result from demoSwitchMapRequest() as an array
    5. demoMergeMapRequest() - switch demoMap() results into Observables that depend on REST API and merge the Observables
    6. demoMergeMapReduce() - returns result from demoMergeMapRequest() as an array
    X. Exit
    `);
}

/**
 * Driver function
 */
function startUp() {
  // input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // closure
  const readMenu = function () {
    displayMenu();

    rl.setPrompt('Selection: ');
    rl.prompt(true);
  };

  // read menu
  readMenu();

  rl.on('line', (ans: string) => { 
    switch (ans) {
      case '1':
        executeDemo('demoMap()', demoMap, readMenu);
        break;

      case '2':
        executeDemo('demoMapReduce()', demoMapReduce, readMenu);
        break;

      case '3':
        executeDemo('demoSwitchMapRequest()', demoSwitchMapRequest, readMenu);
        break;

      case '4':
        executeDemo('demoSwitchMapReduce()', demoSwitchMapReduce, readMenu);
        break;

      case '5':
        executeDemo('demoMergeMapRequest()', demoMergeMapRequest, readMenu);
        break;

      case '6':
        executeDemo('demoMergeMapReduce()', demoMergeMapReduce, readMenu);
        break;

      case 'X':
      case 'x':
        rl.close();
        break;
    }
  });

  rl.on('close', () => { 
    console.log('Good Bye!');
    process.exit(0);
  });
}

startUp();