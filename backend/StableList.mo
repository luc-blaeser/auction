// Partially adopted from `mo:base/Buffer`.

import Prim "mo:prim";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";

module {
    public class List<T>() {
        // TODO: Can we avoid exposing the fields? Some module-internal flag?
        public var elements : [var ?T] = [var];
        public var count = 0;
    };

    public func size<T>(list : List<T>) : Nat {
        list.count;
    };

    public func isEmpty<T>(list: List<T>) : Bool {
        list.count == 0;
    };

    public func add<T>(list : List<T>, element : T) {
        if (list.count == list.elements.size()) {
            grow(list);
        };
        list.elements[list.count] := ?element;
        list.count += 1;
    };

    func grow<T>(list : List<T>) {
        let original = list.elements;
        let newCapacity = Nat.max(1, original.size() * 2);
        let copy = Prim.Array_init<?T>(newCapacity, null);
        var index = 0;
        while (index < list.count) {
            copy[index] := original[index];
            index += 1;
        };
        list.elements := copy;
    };

    public func get<T>(list : List<T>, index : Nat) : T {
        switch (list.elements[index]) {
            case (?element) element;
            case null Prim.trap("Index out of bounds");
        };
    };

    public func last<T>(list: List<T>) : T {
        if (list.count == 0) {
            Prim.trap("Empty list");
        };
        get(list, list.count - 1: Nat);
    };

    public func toArray<T>(list : List<T>) : [T] {
        Prim.Array_tabulate<T>(list.count, func(index) { get(list, index) });
    };

    public func iterate<T>(list : List<T>) : Iter.Iter<T> = toArray(list).vals();

    public func map<X, Y>(list : List<X>, mapElement : X -> Y) : List<Y> {
        let result = List<Y>();
        for (element in iterate(list)) {
            add(result, mapElement(element));
        };
        result;
    };

    public func find<T>(list: List<T>, criterion: T -> Bool) : ?T {
        for (element in iterate(list)) {
            if (criterion(element)) {
                return ?element;
            }
        };
        null;
    } 
};
