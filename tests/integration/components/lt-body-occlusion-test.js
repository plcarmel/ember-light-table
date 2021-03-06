import { click, findAll, find, triggerEvent, settled, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import setupMirageTest from 'ember-cli-mirage/test-support/setup-mirage';
import Table from 'ember-light-table';
import hasClass from '../../helpers/has-class';
import Columns from '../../helpers/table-columns';
import { run } from '@ember/runloop';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';

module('Integration | Component | lt body | occlusion', function(hooks) {
  setupRenderingTest(hooks);
  setupMirageTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
    registerWaiter();
  });

  hooks.beforeEach(function() {
    this.set('sharedOptions', {
      fixedHeader: false,
      fixedFooter: false,
      height: '500px',
      occlusion: true,
      estimatedRowHeight: 30,
      frameId: 'some-frame'
    });
  });

  test('it renders', async function(assert) {
    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{lt-body sharedOptions=sharedOptions}}
        </div>
      </div>
    `);
    assert.equal(find('*').textContent.trim(), '');
  });

  test('row selection - enable or disable', async function(assert) {
    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 1) }));
    this.set('canSelect', false);

    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{lt-body table=table sharedOptions=sharedOptions canSelect=canSelect}}
        </div>
      </div>
    `);

    let row = find('tr');

    assert.notOk(hasClass(row, 'is-selectable'));
    assert.notOk(hasClass(row, 'is-selected'));
    await click(row);
    assert.notOk(hasClass(row, 'is-selected'));

    run(() => {
      this.set('canSelect', true);
    });

    assert.ok(hasClass(row, 'is-selectable'));
    assert.notOk(hasClass(row, 'is-selected'));
    await click(row);
    assert.ok(hasClass(row, 'is-selected'));
  });

  test('row selection - ctrl-click to modify selection', async function(assert) {
    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 5) }));

    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{lt-body
            table=table
            scrollBuffer=200
            sharedOptions=sharedOptions
            canSelect=true
            multiSelect=true
          }}
        </div>
      </div>
    `);
    let firstRow = find('tr:nth-child(2)');
    let middleRow = find('tr:nth-child(4)');
    let lastRow = find('tr:nth-child(6)');

    assert.equal(findAll('tbody tr').length, 5);

    await click(firstRow);
    assert.equal(findAll('tr.is-selected').length, 1, 'clicking a row selects it');

    await click(lastRow, { shiftKey: true });
    assert.equal(findAll('tr.is-selected').length, 5, 'shift-clicking another row selects it and all rows between');

    await click(middleRow, { ctrlKey: true });
    assert.equal(findAll('tr.is-selected').length, 4, 'ctrl-clicking a selected row deselects it');

    await click(firstRow);
    assert.equal(findAll('tr.is-selected').length, 0, 'clicking a selected row deselects all rows');
  });

  test('row selection - click to modify selection', async function(assert) {
    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 5) }));

    await render(
      hbs `
        <div id='some-frame'>
          <div class='lt-scrollable'>
            {{lt-body table=table sharedOptions=sharedOptions canSelect=true multiSelect=true multiSelectRequiresKeyboard=false}}
          </div>
        </div>
    `);

    let firstRow = find('tr:nth-child(2)');
    let middleRow = find('tr:nth-child(4)');
    let lastRow = find('tr:nth-child(6)');

    assert.equal(findAll('tbody tr').length, 5);

    await click(firstRow);
    assert.equal(findAll('tr.is-selected').length, 1, 'clicking a row selects it');

    await click(lastRow, { shiftKey: true });
    assert.equal(findAll('tr.is-selected').length, 5, 'shift-clicking another row selects it and all rows between');

    await click(middleRow);
    assert.equal(findAll('tr.is-selected').length, 4, 'clicking a selected row deselects it without affecting other selected rows');

    await click(middleRow);
    assert.equal(findAll('tr.is-selected').length, 5, 'clicking a deselected row selects it without affecting other selected rows');
  });

  test('row actions', async function(assert) {
    assert.expect(2);

    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 1) }));
    this.actions.onRowClick = (row) => assert.ok(row);
    this.actions.onRowDoubleClick = (row) => assert.ok(row);
    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{lt-body table=table sharedOptions=sharedOptions onRowClick=(action 'onRowClick') onRowDoubleClick=(action 'onRowDoubleClick')}}
        </div>
      </div>
    `);

    let row = find('tr');
    await click(row);
    await triggerEvent(row, 'dblclick');
  });

  test('hidden rows', async function(assert) {
    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 5) }));

    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{lt-body table=table sharedOptions=sharedOptions}}
        </div>
      </div>
    `);

    assert.equal(findAll('tbody tr').length, 5);

    run(() => {
      this.table.rows.objectAt(0).set('hidden', true);
      this.table.rows.objectAt(1).set('hidden', true);
    });
    await settled();

    assert.equal(findAll('tbody tr').length, 3);

    run(() => {
      this.table.rows.objectAt(0).set('hidden', false);
    });
    await settled();

    assert.equal(findAll('tbody tr').length, 4);
  });

  test('overwrite', async function(assert) {
    this.set('table', Table.create({ columns: Columns, rows: this.server.createList('user', 5) }));

    await render(hbs `
      <div id='some-frame'>
        <div class='lt-scrollable'>
          {{#lt-body table=table sharedOptions=sharedOptions overwrite=true as |columns rows|}}
            {{columns.length}}, {{rows.length}}
          {{/lt-body}}
        </div>
      </div>
    `);

    assert.equal(find('*').textContent.trim(), '6, 5');
  });
});
