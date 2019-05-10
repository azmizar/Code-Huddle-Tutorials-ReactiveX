/**
 * 3rd party import
 */
import { from, Observable, Subscription } from 'rxjs';
import { mergeMap, map, reduce } from 'rxjs/operators';
import request from 'request';

/**
 * map demo
 */
function demoMap(): Observable<{ id: number, data: {} | null }> {
  return from([1, 3, 4]).pipe(
    map((val) => { 
      return { id: val, data: null };
    })
  );
}

/**
 * reduce demo
 */
function demoMapReduce(): Observable<{ id: number, data: {} | null }[]> {
  return demoMap().pipe(
    reduce((acc: { id: number, data: {} | null }[], data: { id: number, data: {} | null }): { id: number, data: {} | null }[] => {
      acc.push(data);
      return acc;
    }, [])
  );
}

/**
 * Driver function
 */
function startUp() {
  // straight map
  const subs: Subscription = demoMap().subscribe((data) => { 
    console.log(JSON.stringify(data));
  }, (err: Error) => { 
      console.log(`Error: ${ err.message }`);      
    }, () => { 
      console.log('Completed(demoMap)');
    });

  // map and reduce
  const subs2: Subscription = demoMapReduce().subscribe((data) => {
    console.log(JSON.stringify(data));
  }, (err: Error) => {
    console.log(`Error: ${ err.message }`);
  }, () => {
    console.log('Completed(demoMapReduce)');
  });
}

startUp();